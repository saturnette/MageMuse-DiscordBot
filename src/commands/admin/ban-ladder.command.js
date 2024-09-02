import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import User from "../../models/user.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";

const data = new SlashCommandBuilder()
  .setName("ban-ladder")
  .setDescription("Banea a un usuario para que no pueda recibir desafíos")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario a banear")
      .setRequired(true)
  );

async function execute(interaction) {

  const userToBan = interaction.options.getUser("user");

  const user = await User.findOne({ _id: userToBan.id });

  if (!user) {
    await interaction.reply("El usuario especificado no existe.");
    return;
  }

  if (user.allowChallenges === false) {
    await interaction.reply(`El usuario ${user.username} ya ha sido baneado.`);
    return;
  }

  user.allowChallenges = false;
  await user.save();

  await interaction.reply(
    `El usuario ${user.username} ha sido baneado exitosamente.`
  );
}

export default { data, execute: adminOnly(execute) };