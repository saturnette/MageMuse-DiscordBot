import User from "../../models/user.model.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import bucket from "../../config/firebase.js";

const data = new SlashCommandBuilder()
  .setName("badges")
  .setDescription("Obtiene las medallas y estadísticas de liga de un entrenador.")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario del que quieres obtener información.")
      .setRequired(false)
  );

async function execute(interaction) {
  const user = interaction.options.getUser("user") || interaction.user;
  await interaction.deferReply();

  const userProfile = await User.findOne({ _id: user.id });

  if (!userProfile) {
    await interaction.followUp(
      "El usuario no tiene un perfil registrado en la base de datos."
    );
    return;
  }

  const file = bucket.file(`profiles/${user.id}.png`);
  let url = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });

  url = url[0] + `&time=${Date.now()}`;

  const embed = new EmbedBuilder()
    .setColor(0xffbf00)
    .setTitle(`Medallero de ${user.globalName || user.username}`)
    .addFields(
      {
        name: "Estadísticas de Liga",
        value: `**🎟️ Alto Mando:** ${
          userProfile.tryEF || "N/A"
        }\n**🔄 Retos Usados:** ${userProfile.tryDay || 0}\n**📝 Registrado:** ${
          userProfile.registered ? "Sí" : "No"
        }`,
        inline: true,
      },
      {
        name: "🏅 Medallas Obtenidas:",
        value:
          userProfile.badges && userProfile.badges.length > 0
            ? userProfile.badges
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

  await interaction.followUp({ embeds: [embed] });
}

export default { data, execute };