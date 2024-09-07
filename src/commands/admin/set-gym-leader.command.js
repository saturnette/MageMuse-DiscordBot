import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import User from "../../models/user.model.js";
import { badgesImages } from "../../utils/badges.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";
import { generateAndSaveProfileImage } from "../../utils/image-generator.js";

const data = new SlashCommandBuilder()
  .setName("set-gym-leader")
  .setDescription("Asigna un tipo y un nombre de medalla a un usuario")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario al que asignar la medalla")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("badgetype")
      .setDescription("El tipo de medalla a asignar")
      .setRequired(true)
  )
  .addStringOption((option) => {
    const badgeOptions = Object.keys(badgesImages).map((badge) => ({
      name: badge,
      value: badge,
    }));
    return option
      .setName("badgename")
      .setDescription("El nombre de la medalla a asignar")
      .setRequired(true)
      .addChoices(...badgeOptions);
  });

async function execute(interaction) {
  await interaction.deferReply(); // Defer the reply to give more time for processing

  const user = interaction.options.getUser("user");
  const badgeType = interaction.options.getString("badgetype");
  const badgeName = interaction.options.getString("badgename");

  await User.findByIdAndUpdate(
    user.id,
    {
      badgeType: badgeType,
      badgeName: badgeName,
      $push: { badges: { badgeType: badgeType, badgeName: badgeName } },
    },
    { upsert: true }
  );

  // Generar y guardar la imagen del perfil
  await generateAndSaveProfileImage(user.id);

  await interaction.followUp(
    `¡${user.username} asciende a líder tipo ${badgeType}, su medalla es ${badgeName}! `
  );
}

export default { data, execute: adminOnly(execute) };