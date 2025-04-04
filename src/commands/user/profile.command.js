import User from "../../models/user.model.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import "dotenv/config";
import bucket from "../../config/firebase.js";

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
  await interaction.deferReply();

  // Buscar o crear el perfil del usuario
  let userProfile = await User.findOne({ _id: user.id });
  if (!userProfile) {
    userProfile = new User({
      _id: user.id,
      username: user.username,
      showdownNick: "anonimo",
      coins: 0,
      elo: 1000,
      badges: [],
      winsLadder: 0,
      lossesLadder: 0,
      favoriteColor: null,
      companionPokemon: null,
      registered: false,
    });
    await userProfile.save();
  }

  const userInfo = await getUserInfo(user.id);

  const avatarURL = user.displayAvatarURL({ format: "png", dynamic: true });

  const users = await User.find().sort({ elo: -1, _id: 1 });

  const ranking = users.findIndex((u) => u.id === userInfo.id) + 1;

  const file = bucket.file(`profiles/${user.id}.png`);
  let url = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });

  url = url[0] + `&time=${Date.now()}`;

  // Determinar el color del embed basado en el color favorito del usuario
  let embedColor;
  if (userInfo.favoriteColor === "red") {
    embedColor = 0xff0000; // Rojo
  } else if (userInfo.favoriteColor === "blue") {
    embedColor = 0x0000ff; // Azul
  } else {
    embedColor = 0xffbf00; // Color por defecto
  }

  const profileLink = `https://palette-dex.vercel.app/profile/${user.id}`;

  const exampleEmbed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`${user.globalName || user.username} (${user.username})`)
    .setAuthor({
      name: interaction.guild.name,
      iconURL: interaction.guild.iconURL(),
    })
    .setThumbnail(avatarURL)
    .addFields(
      {
        name: " ",
        value: `**🎯 Showdown:** ${userInfo.showdownNick || "N/A"}\n**💰 Pokécoins:** ${userInfo.coins || 0}\n**🦄 Compañero:** ${
          userInfo.companionPokemon ? userInfo.companionPokemon.name : "N/A"
        }\n**🎨 Color Favorito:** ${userInfo.favoriteColor ? userInfo.favoriteColor.charAt(0).toUpperCase() + userInfo.favoriteColor.slice(1) : "N/A"}`,
        inline: true,
      },
      { name: "\u200B", value: "\u200B" },
      {
        name: "Estadísticas de Liga",
        value: `**🎟️ Alto Mando:** ${
          userInfo.tryEF || "N/A"
        }\n**🔄 Retos Usados:** ${userInfo.tryDay || 0}\n**📝 Registrado:** ${
          userInfo.registered ? "Sí" : "No"
        }`,
        inline: true,
      },
      { name: "\u200B", value: "\u200B" },
      {
        name: "Estadísticas de Ladder",
        value: `**⭐ Elo:** ${
          userInfo.elo.toString() || "N/A"
        }\n**👑 Rank:** #${ranking.toString() || "N/A"}\n**🚀 Combates:** ${
          (userInfo.winsLadder || 0) + (userInfo.lossesLadder || 0)
        } - **Wins:** ${userInfo.winsLadder || 0} - **Losses:** ${
          userInfo.lossesLadder || 0
        }\n**🎀 Efectividad:** ${
          (userInfo.winsLadder || 0) + (userInfo.lossesLadder || 0) === 0
            ? "0"
            : Math.round(
                ((userInfo.winsLadder || 0) /
                  ((userInfo.winsLadder || 0) + (userInfo.lossesLadder || 0))) *
                  100
              )
        }%`,
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
      },
      {
        name: "🔗 Perfil",
        value: `[Ver perfil completo](${profileLink})`,
        inline: false,
      }
    )
    .setImage(url)
    .setTimestamp();
  await interaction.followUp({
    embeds: [exampleEmbed],
  });
}

async function getUserInfo(userId) {
  const user = await User.findById(userId);

  if (!user) return null;

  return user;
}

export default { data, execute };