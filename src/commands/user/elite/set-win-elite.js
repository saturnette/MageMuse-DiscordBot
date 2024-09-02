import { SlashCommandBuilder } from "discord.js";
import User from "../../../models/user.model.js";
import Role from "../../../models/role.model.js";
import Channel from "../../../models/channel.model.js";

const data = new SlashCommandBuilder()
  .setName("set-win-elite")
  .setDescription("Registra una victoria del alto mando.")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario que ha perdido.")
      .setRequired(true)
  );

async function execute(interaction) {

  // Obtener el rol elite de la base de datos
  const roleData = await Role.findOne({});
  const eliteRoleId = roleData?.elite;

  // Obtener el canal log de la base de datos
  const channelData = await Channel.findOne({});
  const logChannelId = channelData?.log;

  // Verificar si el usuario tiene el rol elite
  if (!interaction.member.roles.cache.has(eliteRoleId)) {
    await interaction.reply('Necesitas ser alto mando para usar este comando.');
    return;
  }

  if(!logChannelId) {
    await interaction.reply('No se ha configurado el canal de bitácora. Usa el comando **/set-channel** para configurarlo.');
    return;
  }

  // Verificar si el comando se está usando en el canal log
  if (interaction.channel.id !== logChannelId) {
    await interaction.reply('Este comando solo puede ser usado en el canal bitácora.');
    return;
  }

  const recipientUser = interaction.options.getUser("user");

  // Asegurarse de que el campo registered esté presente y obtener el perfil del usuario
  const userProfile = await User.findOneAndUpdate(
    { _id: recipientUser.id },
    { $setOnInsert: { registered: false } },
    { new: true, upsert: true }
  );

  // Verificar si el usuario está registrado
  if (!userProfile.registered) {
    await interaction.reply(`${recipientUser.username} no está registrado en la liga.`);
    return;
  }

  if (userProfile.tryEF === 0) {
    await interaction.reply(
      `${recipientUser.username} no tiene intentos, no puedes ganarle.`
    );
    return;
  }

  userProfile.tryEF -= 1;
  await userProfile.save();

  await interaction.reply(
    `${recipientUser.username} ha perdido, ha gastado un boleto al alto mando.`
  );
}

export default { data, execute };