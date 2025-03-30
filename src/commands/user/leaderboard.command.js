import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import bucket from "../../config/firebase.js";

const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Obtiene la tabla de clasificación del servidor.");

async function execute(interaction) {
  const file = bucket.file("leaderboard/leaderboard.png");
  const timestamp = Date.now();
  const url = `https://storage.googleapis.com/${bucket.name}/${file.name}?t=${timestamp}`;

  const serverName = interaction.guild.name;

  const embed = new EmbedBuilder()
    .setColor(0xffbf00)
    .setTitle(`Tabla de clasificación / ${serverName}`)
    .setImage(url)
    .setDescription("[Haz click aquí para saber más de los top players](https://palette-dex.vercel.app/)");

  await interaction.reply({
    embeds: [embed],
  });
}

export default { data, execute };