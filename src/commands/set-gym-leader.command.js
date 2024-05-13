import { SlashCommandBuilder } from "discord.js";
import User from "../models/user.model.js";

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
  .addStringOption((option) =>
    option
      .setName("badgename")
      .setDescription("El nombre de la medalla a asignar")
      .setRequired(true)
  );

async function execute(interaction) {
  const user = interaction.options.getUser("user");
  const badgeType = interaction.options.getString("badgetype");
  const badgeName = interaction.options.getString("badgename");

  await User.findByIdAndUpdate(user.id, {
    badgeType: badgeType,
    badgeName: badgeName,
    $push: { badges: { badgeType: badgeType, name: badgeName } },
  });

  await interaction.reply(
    `¡${user.username} asciende a líder tipo ${badgeType}, su medalla es ${badgeName}! `
  );
}

export default { data, execute };