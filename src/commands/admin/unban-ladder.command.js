import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import User from "../../models/user.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";

const data = new SlashCommandBuilder()
  .setName("unban-ladder")
  .setDescription("Desbanea a un usuario para que pueda recibir desafíos")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario a desbanear")
      .setRequired(true)
  );

async function execute(interaction) {

  const userToUnban = interaction.options.getUser("user");

  const user = await User.findOne({ _id: userToUnban.id });

  if (!user) {
    await interaction.reply("El usuario especificado no existe.");
    return;
  }

  if (user.allowChallenges === true) {
    await interaction.reply(`El usuario ${user.username} ya está desbaneado.`);
    return;
  }

  user.allowChallenges = true;
  await user.save();

  await interaction.reply(
    `El usuario ${user.username} ha sido desbaneado exitosamente.`
  );
}

export default { data, execute: adminOnly(execute) };