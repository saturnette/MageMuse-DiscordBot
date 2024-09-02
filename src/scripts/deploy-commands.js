import { REST, Routes } from "discord.js";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import "dotenv/config";

const commands = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "../commands");

// Función recursiva para obtener todos los archivos de comandos
function getCommandFiles(dir) {
  let commandFiles = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      commandFiles = commandFiles.concat(getCommandFiles(filePath));
    } else if (file.endsWith(".js")) {
      commandFiles.push(filePath);
    }
  }

  return commandFiles;
}

const commandFiles = getCommandFiles(foldersPath);

for (const filePath of commandFiles) {
  const moduleURL = pathToFileURL(filePath);
  const commandModule = await import(moduleURL);
  const command = commandModule.default;

  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[WARNING] The command in ${filePath} does not have the required "data" or "execute" properties.`
    );
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(
      `Started updating ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.SERVER_ID
      ),
      { body: commands }
    );

    console.log(
      `${data.length} application (/) commands were successfully reloaded.`
    );
  } catch (error) {
    console.error(error);
  }
})();