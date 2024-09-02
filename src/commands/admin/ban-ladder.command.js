import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import User from "../../models/user.model.js";

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
  // Verificar si el usuario que ejecuta el comando tiene permisos de administrador
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply('Solo los administradores pueden usar este comando.');
    return;
  }

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

export default { data, execute };