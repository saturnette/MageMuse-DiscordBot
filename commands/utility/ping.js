import { SlashCommandBuilder } from "discord.js";

// Creamos un nuevo comando slash usando SlashCommandBuilder
// Establecemos el nombre del comando como "ping"
// Y la descripción del comando como "Replies with Pong!"
const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

// Definimos la función que se ejecutará cuando se use el comando
// Esta función es asíncrona para poder usar 'await' dentro de ella
async function execute(interaction) {
  // Respondemos a la interacción (el comando slash) con "Pong!"
  await interaction.reply("Pong!");
}

// Exportamos el comando (la data y la función execute) como un objeto
export default { data, execute };