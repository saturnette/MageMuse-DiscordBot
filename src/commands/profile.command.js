import User from "../models/user.model.js";

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { loadImage, createCanvas } from "canvas";
import axios from "axios";
import { createReadStream } from "streamifier";
import "dotenv/config";
import bucket from "../config/firebase.js";
import { badgesData } from "../config/images.js";


const badges = [
  { x: 25, y: 5, width: 50, height: 50 },
  { x: 100, y: 5, width: 50, height: 50 },
  { x: 175, y: 5, width: 50, height: 50 },
  { x: 250, y: 5, width: 50, height: 50 },
  { x: 325, y: 5, width: 50, height: 50 },
  { x: 25, y: 75, width: 50, height: 50 },
  { x: 100, y: 75, width: 50, height: 50 },
  { x: 175, y: 75, width: 50, height: 50 },
  { x: 250, y: 75, width: 50, height: 50 },
  { x: 325, y: 75, width: 50, height: 50 },
];

async function getPokemonSprite(pokemonName) {
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );
  return response.data.sprites.front_default;
}

const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Obtiene información de un entrenador.")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario del que quieres obtener información.")
      .setRequired(false)
  );

async function execute(interaction) {
  const user = interaction.options.getUser("user") || interaction.user;
  await interaction.reply({ content: "Obteniendo datos...", fetchReply: true });

  const userProfile = await User.findOneAndUpdate(
    { _id: user.id },
    { $setOnInsert: { _id: user.id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const numBadges = userProfile.badges.length ? userProfile.badges.length : 0;

  let backgroundImageUrl;

  if (numBadges < 5) {
    backgroundImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg1.png?alt=media&token=b5d65c15-99d4-48e5-8dfd-b4858cc28cf1";
  } else if (numBadges >= 5 && numBadges <= 7) {
    backgroundImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg2.png?alt=media&token=f7d2e07b-b06e-408f-86d3-609251f03a91";
  } else if (numBadges >= 8 && numBadges <= 9) {
    backgroundImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg3.png?alt=media&token=bc115b2b-0806-4b42-9dae-db38084659bf";
  } else if (numBadges == 10) {
    backgroundImageUrl =
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg4.png?alt=media&token=645f80a1-3dc7-439c-90e7-920a4566e51f";
  }

  const userInfo = await getUserInfo(user.id);

  const avatarURL = user.displayAvatarURL({ format: "png", dynamic: true });

  const users = await User.find().sort({ elo: -1, _id: 1 });

  const ranking = users.findIndex((user) => user.id === userInfo.id) + 1;

  const canvas = createCanvas(800, 500);
  const context = canvas.getContext("2d");

  const backgroundImage = await loadImage(backgroundImageUrl);

  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  const badgeNames = Object.keys(badgesData);
  for (let index = 0; index < badgeNames.length; index++) {
    const badgeName = badgeNames[index];
    const hasBadge = userInfo.badges.some(
      (badge) => badge.badgeName === badgeName
    );
    const imageUrl = hasBadge
      ? badgesData[badgeName].normal
      : badgesData[badgeName].silhouette;
    const image = await loadImage(imageUrl);
    context.drawImage(
      image,
      badges[index].x * 2,
      badges[index].y * 2,
      badges[index].width * 2,
      badges[index].height * 2
    );
  }

  const pokeballIconUrl =
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fpokeballbg.png?alt=media&token=7aac7dcf-d671-4591-9137-95e0cc9d3dec";
  const pokeballIcon = await loadImage(pokeballIconUrl);
  const row1 = userInfo.team.slice(0, 6);
  const row2 = userInfo.team.slice(6, 12);

  for (let i = 0; i < row1.length; i++) {
    const pokemonName = row1[i];
    if (pokemonName) {
      const spriteUrl = await getPokemonSprite(pokemonName);
      const spriteImage = await loadImage(spriteUrl);

      context.drawImage(pokeballIcon, 100 * i, 310, 100, 100);
      context.drawImage(spriteImage, 100 * i, 310, 100, 100);
    }
  }

  for (let i = 0; i < row2.length; i++) {
    const pokemonName = row2[i];
    if (pokemonName) {
      const spriteUrl = await getPokemonSprite(pokemonName);
      const spriteImage = await loadImage(spriteUrl);

      context.drawImage(pokeballIcon, 100 * (i + 2), 400, 100, 100);
      context.drawImage(spriteImage, 100 * (i + 2), 400, 100, 100);
    }
  }

  const buffer = canvas.toBuffer("image/png");

  const file = bucket.file(`profiles/${user.id}.png`);
  const stream = file.createWriteStream({
    metadata: {
      contentType: "image/png",
    },
  });
  createReadStream(buffer).pipe(stream);

  await new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", resolve);
  });

  let url = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });

  url = url[0] + `&time=${Date.now()}`;

  const exampleEmbed = new EmbedBuilder()
    .setColor(0xffbf00)
    .setTitle(`${user.globalName} (${user.username})`)
    .setAuthor({
      name: "Pueblo Paleta",
      iconURL:
        "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fpueblopaletaservericon.png?alt=media&token=18bb0709-7636-4483-baf1-5906b0a81adc",
    })
    .setThumbnail(avatarURL)
    .addFields(
      {
        name: " ",
        value: `**🎯 Showdown:** ${
          userInfo.showdownNick || "N/A"
        }\n**⭐ Elo:** ${userInfo.elo.toString() || "N/A"}\n**👑 Rank:** #${
          ranking.toString() || "N/A"
        }\n**🎟️ Alto Mando:** ${userInfo.tryEF || "N/A"}`,
        inline: true,
      },
      { name: "\u200B", value: "\u200B" },

      {
        name: "🏅 Medallas Obtenidas:",
        value:
          userInfo && userInfo.badges && userInfo.badges.length > 0
            ? userInfo.badges
                .map(
                  (badge) =>
                    `- Medalla: **${badge.badgeName}** — Gimnasio: **${badge.badgeType}**`
                )
                .join("\n")
            : "N/A",
        inline: false,
      }
    )
    .setImage(url)
    .setTimestamp();
  await interaction.editReply({
    content: "¡Datos obtenidos!",
    embeds: [exampleEmbed],
  });
}

async function getUserInfo(userId) {
  const user = await User.findById(userId);

  if (!user) return null;

  return user;
}

export default { data, execute };
