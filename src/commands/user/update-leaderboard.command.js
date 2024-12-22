import { SlashCommandBuilder } from "discord.js";
import { generateLeaderboardImage } from "../../utils/leaderboard-generator.js";

const data = new SlashCommandBuilder()
  .setName("update-leaderboard")
  .setDescription("Actualiza la imagen del leaderboard");

async function execute(interaction) {
  try {
    await interaction.reply({ content: "Actualizando imagen del leaderboard...", fetchReply: true });
    await generateLeaderboardImage(interaction.client);
    await interaction.editReply("¡Imagen del leaderboard actualizada!");
  } catch (error) {
    console.error(error);
    await interaction.followUp("Ha ocurrido un error actualizando la imagen del leaderboard.");
  }
}

export default { data, execute };