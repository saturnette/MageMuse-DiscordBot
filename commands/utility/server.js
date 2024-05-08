import { SlashCommandBuilder } from "discord.js";

// Creamos un nuevo comando slash usando SlashCommandBuilder
// Establecemos el nombre del comando como "server"
// Y la descripción del comando como "Provides information about the server."
const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Provides information about the server.");

// Definimos la función que se ejecutará cuando se use el comando
// Esta función es asíncrona para poder usar 'await' dentro de ella
async function execute(interaction) {
  // Respondemos a la interacción (el comando slash) con información sobre el servidor
  // Usamos las propiedades 'name' y 'memberCount' del objeto 'guild' de la interacción
  await interaction.reply(
    `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
  );
}

// Exportamos el comando (la data y la función execute) como un objeto
export default { data, execute };