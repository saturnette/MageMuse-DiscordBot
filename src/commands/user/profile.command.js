import User from "../../models/user.model.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { loadImage, createCanvas } from "canvas";
import axios from "axios";
import { createReadStream } from "streamifier";
import "dotenv/config";
import bucket from "../../config/firebase.js";
import { badgesImages, badgesCoordinates, getBackgroundImageUrl, pokeballIconUrl } from "../../utils/badges.js";

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

  let backgroundImageUrl = getBackgroundImageUrl(numBadges);

  const userInfo = await getUserInfo(user.id);

  const avatarURL = user.displayAvatarURL({ format: "png", dynamic: true });

  const users = await User.find().sort({ elo: -1, _id: 1 });

  const ranking = users.findIndex((user) => user.id === userInfo.id) + 1;

  const canvas = createCanvas(800, 500);
  const context = canvas.getContext("2d");

  const backgroundImage = await loadImage(backgroundImageUrl);

  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  const badgeNames = Object.keys(badgesImages);

  for (let index = 0; index < badgeNames.length; index++) {
    const badgeName = badgeNames[index];
    const hasBadge = userInfo.badges.some(
      (badge) => badge.badgeName === badgeName
    );
    const imageUrl = hasBadge
      ? badgesImages[badgeName].normal
      : badgesImages[badgeName].silhouette;
    const image = await loadImage(imageUrl);
    context.drawImage(
      image,
      badgesCoordinates[index].x * 2,
      badgesCoordinates[index].y * 2,
      badgesCoordinates[index].width * 2,
      badgesCoordinates[index].height * 2
    );
  }

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
      name: interaction.guild.name,
      iconURL: interaction.guild.iconURL(),
    })
    .setThumbnail(avatarURL)
    .addFields(
      {
        name: " ",
        value: `**🎯 Showdown:** ${
          userInfo.showdownNick || "N/A"
        }\n**⭐ Elo:** ${userInfo.elo.toString() || "N/A"}\n**👑 Rank:** #${
          ranking.toString() || "N/A"
        }\n**🎟️ Alto Mando:** ${userInfo.tryEF || "N/A"}\n**🔄 Retos Usados:** ${
          userInfo.tryDay || 0
        }\n**📝 Registrado:** ${userInfo.registered ? "Sí" : "No"}`,
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

async function getPokemonSprite(pokemonName) {
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );
  return response.data.sprites.front_default;
}

export default { data, execute };
