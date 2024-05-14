import User from "../models/user.model.js";

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { loadImage, createCanvas } from "canvas";
import axios from "axios";
import { createReadStream } from "streamifier";
import "dotenv/config";
import bucket from "../config/firebase.js";

const badgesData = {
  Valka: {
    normal:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fvolador.png?alt=media&token=f4fac454-8640-4b93-bcb5-51e371db2163",
    silhouette:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fvoladorsilueta.png?alt=media&token=297ac7d3-3291-4db0-ab6f-2a66021dc488",
  },

  Muscle: {
    normal:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fmuscle.png?alt=media&token=c08567b7-2de7-4492-8cb6-792a9e8f7298",
    silhouette:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fmusclesilueta.png?alt=media&token=176d560b-e57f-424b-a08d-b42d5e9a472a",
  },

  //falta
  Aura: {
    normal:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fnormal.png?alt=media&token=6f88675e-9ad8-49a8-96b8-9062f1b06350",
    silhouette:
    "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fnormalsilueta.png?alt=media&token=44a8820a-ebed-41b4-8636-e80f24c3622c",
  },

  Divina: {
    normal:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fnormal.png?alt=media&token=6f88675e-9ad8-49a8-96b8-9062f1b06350",
    silhouette:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fnormalsilueta.png?alt=media&token=44a8820a-ebed-41b4-8636-e80f24c3622c",
  },
  Cascada: {
    normal:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fagua.png?alt=media&token=26387725-b653-49d8-b6bf-eebc58d0b181",
    silhouette:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Faguasilueta.png?alt=media&token=241ab192-aa12-4266-afb7-1f7f94979973",
  },

  Sakamoto: {
    normal:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fsiniestro.png?alt=media&token=131ee221-08a0-42c3-9173-3883e738d006",
    silhouette:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fsiniestrosilueta.png?alt=media&token=89e73fe7-25c3-4d12-9575-8fea05779e80",
  },
  Cansanscio: {
    normal:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Froca.png?alt=media&token=4f20083c-b9fe-4649-9577-34f0eed43d15",
    silhouette:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Frocasilueta.png?alt=media&token=d7435d26-c2e9-4e46-a2c2-76152d72ea90",
  },
  Resplandor: {
    normal:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fhada.png?alt=media&token=02947033-cf4e-4d18-aa97-18cd1e05ce1e",
    silhouette:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fhadasilueta.png?alt=media&token=e4287c4d-056a-4cca-98b7-ac0c3fc55384",
  },

  Ferraguardia: {
    normal:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Facero.png?alt=media&token=0c35fb02-f177-43f8-a17b-72507eb3e251",
    silhouette:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Facerosilueta.png?alt=media&token=de4f0cc1-a257-40ae-91bf-f5d2f246ae5a",
  },

  Arcade: {
    normal:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fel%C3%A9ctrica.png?alt=media&token=ce181614-340e-4194-9cd2-048f0517857d",

    silhouette:
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/badges%2Fel%C3%A9ctricasilueta.png?alt=media&token=7fd05008-9659-4648-a382-f801ff72c5ac",
  },
};

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
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg1.png?alt=media&token=bd26a18c-b21d-4d1a-a150-919daf9d92e2";
  } else if (numBadges >= 5 && numBadges <= 7) {
    backgroundImageUrl =
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg2.png?alt=media&token=f678cf9c-1f7d-4f64-a4e2-41d708458f1b";
  } else if (numBadges >= 8 && numBadges <= 9) {
    backgroundImageUrl =
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg3.png?alt=media&token=ee75c68a-22e5-4e91-bf80-a0e581682aab";
  } else if (numBadges == 10) {
    backgroundImageUrl =
      "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fbg4.png?alt=media&token=99fb6552-b7c2-4aae-9249-214c76469597";
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
        "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/pueblopaletaservericon.png?alt=media&token=1b0a6dc9-bb5e-4e66-8b0c-0d7b8c05a302",
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
