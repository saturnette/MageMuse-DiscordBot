import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";

// Creamos una nueva instancia del cliente
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Creamos una nueva colección para los comandos del cliente
client.commands = new Collection();

// Obtenemos la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);

// Obtenemos la ruta del directorio actual
const __dirname = path.dirname(__filename);

// Obtenemos la ruta del directorio de comandos
const foldersPath = path.join(__dirname, "commands");

// Obtenemos la lista de carpetas de comandos
const commandFolders = fs.readdirSync(foldersPath);

// Recorremos cada carpeta de comandos
for (const folder of commandFolders) {

  // Obtenemos la ruta de la carpeta de comandos actual
  const commandsPath = path.join(foldersPath, folder);

  // Obtenemos la lista de archivos de comandos en la carpeta actual
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  // Recorremos cada archivo de comando
  for (const file of commandFiles) {

    // Obtenemos la ruta del archivo de comando actual
    const filePath = path.join(commandsPath, file);

    // Convertimos la ruta del archivo a una URL de archivo
    const moduleURL = pathToFileURL(filePath);

    // Importamos el módulo del comando
    const commandModule = await import(moduleURL);

    // Obtenemos el comando exportado del módulo
    const command = commandModule.default;

    // Agregamos el comando a la colección de comandos del cliente
    // utilizando el nombre del comando como clave y el módulo exportado como valor
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] El comando en ${filePath} no tiene las propiedades "data" o "execute" requeridas.`
      );
    }
  }
}

// Cuando el cliente esté listo, ejecuta este código (solo una vez).
// La distinción entre `client: Client<boolean>` y `readyClient: Client<true>` es importante para los desarrolladores de TypeScript.
// Esto hace que algunas propiedades no sean nulas.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`¡Listo! Conectado como ${readyClient.user.tag}`);
});

// Escucha el evento de creación de interacciones
client.on(Events.InteractionCreate, async (interaction) => {

  // Verifica si la interacción es un comando de entrada de chat
  if (!interaction.isChatInputCommand()) return;

  // Obtiene el comando correspondiente al nombre de la interacción
  const command = interaction.client.commands.get(interaction.commandName);

  // Verifica si se encontró un comando
  if (!command) {
    console.error(`No se encontró ningún comando que coincida con ${interaction.commandName}.`);
    return;
  }

  try {
    // Ejecuta el comando
    await command.execute(interaction);

  } catch (error) {
    console.error(error);
    
    // Maneja el error al ejecutar el comando
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

// Inicia sesión en Discord con el token de tu cliente
client.login(process.env.DISCORD_TOKEN);
