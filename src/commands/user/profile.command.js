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

  const userProfile = await User.findOneAndUpdate(
    { _id: user.id },
    { $setOnInsert: { _id: user.id } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const userInfo = await getUserInfo(user.id);

  const avatarURL = user.displayAvatarURL({ format: "png", dynamic: true });

  const users = await User.find().sort({ elo: -1, _id: 1 });

  const ranking = users.findIndex((user) => user.id === userInfo.id) + 1;

  const file = bucket.file(`profiles/${user.id}.png`);
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