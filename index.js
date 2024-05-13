import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import { connectWithRetry } from "./src/config/db.js";
import "./src/jobs/game-retry.job.js";
import "./src/jobs/elo-decay.job.js";

connectWithRetry();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "./src/commands");

const commandFiles = fs
  .readdirSync(foldersPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(foldersPath, file);
  const moduleURL = pathToFileURL(filePath);
  const commandModule = await import(moduleURL);
  const command = commandModule.default;

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] El comando en ${filePath} no tiene las propiedades "data" o "execute" requeridas.`
    );
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Connected as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(
      `No se encontró ningún comando que coincida con ${interaction.commandName}.`
    );
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "¡Hubo un error al ejecutar este comando!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "¡Hubo un error al ejecutar este comando!",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
