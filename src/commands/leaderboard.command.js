import User from "../models/user.model.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { registerFont, createCanvas, loadImage } from "canvas";
import fetch from "node-fetch";
import sharp from "sharp";
import bucket from "../config/firebase.js";
import { createReadStream } from "streamifier";
import "dotenv/config";

const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("Obtiene la tabla de clasificación de Pueblo Paleta 🎨");

async function execute(interaction) {
  const users = await User.find().sort({ elo: -1, _id: 1 }).limit(10);  
  await interaction.reply({ content: "Calculando elo...", fetchReply: true });

  const canvasWidth = 700;
  const canvasHeight = users.length * 60;

  registerFont("./src/font/arial.ttf", { family: "Arial" });

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const context = canvas.getContext("2d");

  context.font = "30px Arial";
  context.fillStyle = "#ffffff";

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    const discordUser = await interaction.client.users.fetch(user._id);

    const avatarURL = discordUser.displayAvatarURL({
      format: "png",
      dynamic: false,
    });

    const response = await fetch(avatarURL);
    const avatarBuffer = await response.arrayBuffer();
    const pngBuffer = await sharp(Buffer.from(avatarBuffer)).png().toBuffer();

    const img = await loadImage(pngBuffer);

    context.drawImage(img, 10, i * 60, 50, 50);

    context.fillStyle = "#2D3142";

    context.fillRect(70, i * 60, 600, 50);

    context.fillStyle = "white";

    if (i === 0) {
      context.fillStyle = "gold";
    } else if (i === 1) {
      context.fillStyle = "silver";
    } else if (i === 2) {
      context.fillStyle = "darkorange";
    } else if (i === 3) {
      context.fillStyle = "green";
    } else {
      context.fillStyle = "white";
    }

    context.fillText(` #${i + 1}`, 70, i * 60 + 35);

    context.fillStyle = "white";

    context.fillText(
      ` / ${user.elo} / ${discordUser.username}`,
      70 + context.measureText(` #${i + 1}`).width,
      i * 60 + 35
    );
  }

  const buffer = canvas.toBuffer();

  const file = bucket.file("leaderboard/leaderboard.png");

  const readStream = createReadStream(buffer);

  await new Promise((resolve, reject) => {
    readStream
      .pipe(file.createWriteStream())
      .on("error", reject)
      .on("finish", resolve);
  });

  await file.makePublic();

  const timestamp = Date.now();

  const url = `https://storage.googleapis.com/${bucket.name}/${file.name}?t=${timestamp}`;

  const serverName = interaction.guild.name;

  const embed = new EmbedBuilder()
    .setColor(0xffbf00)
    .setTitle(`Tabla de clasificación / ${serverName}`)
    .setImage(url);

  await interaction.editReply({
    content: "¡Nueva tabla de clasificación!",
    embeds: [embed],
  });
}

export default { data, execute };
