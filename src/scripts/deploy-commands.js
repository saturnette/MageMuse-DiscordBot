import { REST, Routes } from "discord.js";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import "dotenv/config";

// Creamos un array vacío para almacenar los comandos
const commands = [];

// Obtenemos el nombre del archivo y el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtenemos la ruta de la carpeta de comandos
const foldersPath = path.join(__dirname, "../commands");

// Leemos los nombres de las carpetas dentro de la carpeta de comandos

// Para cada carpeta, leemos los archivos de comandos
const commandFiles = fs
  .readdirSync(foldersPath)
  .filter((file) => file.endsWith(".js"));

  // Para cada archivo de comando, lo importamos y lo añadimos al array de comandos
  for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const moduleURL = pathToFileURL(filePath);
    const commandModule = await import(moduleURL);
    const command = commandModule.default;
    // Si el comando tiene las propiedades "data" y "execute", lo añadimos al array
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {

      // Si no, mostramos una advertencia
      console.log(
        `[ADVERTENCIA] El comando en ${filePath} no tiene las propiedades "data" o "execute" requeridas.`
      );
    }
  
}

// Creamos una nueva instancia del módulo REST y establecemos el token de Discord
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Desplegamos los comandos
(async () => {
  try {

    // Mostramos un mensaje indicando que se ha iniciado el proceso de despliegue
    console.log(
      `Comenzó la actualización de ${commands.length} comandos de la aplicación (/).`
    );

    // Usamos el método put para actualizar todos los comandos en el servidor con el conjunto actual
    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.SERVER_ID
      ),
      { body: commands }
    );

    // Mostramos un mensaje indicando que los comandos se han desplegado correctamente
    console.log(
      `Se recargaron exitosamente ${data.length} comandos de la aplicación (/).`
    );
  } catch (error) {

    // Si ocurre un error, lo capturamos y lo mostramos en la consola
    console.error(error);
  }
})();