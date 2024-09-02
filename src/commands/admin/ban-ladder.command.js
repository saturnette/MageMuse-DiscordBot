import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Banea a un usuario para que no pueda recibir desafíos")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario a banear")
      .setRequired(true)
  );

async function execute(interaction) {

  if (!interaction.member.roles.cache.has('1125885671291224196')) {
    await interaction.reply('No tienes el rol necesario para usar este comando.');
    return;
  }
  
  const userToBan = interaction.options.getUser("user");

  const user = await User.findOne({ _id: userToBan.id });

  if (!user) {
    await interaction.reply("El usuario especificado no existe.");
    return;
  }

  user.allowChallenges = false;
  await user.save();

  await interaction.reply(
    `El usuario ${userToBan.username} ha sido baneado exitosamente.`
  );
}

export default { data, execute };