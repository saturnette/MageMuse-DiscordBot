import User from "../../../models/user.model.js";
import Role from "../../../models/role.model.js";
import Channel from "../../../models/channel.model.js";
import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("set-win-leader")
  .setDescription("¡Registra una victoria!")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario que ha perdido.")
      .setRequired(true)
  );

async function execute(interaction) {
  const losingUser = interaction.options.getUser("user");

  // Obtener el rol leader de la base de datos
  const roleData = await Role.findOne({});
  const leaderRoleId = roleData?.leader;

  // Obtener el canal log de la base de datos
  const channelData = await Channel.findOne({});
  const logChannelId = channelData?.log;

  // Verificar si el usuario tiene el rol leader
  if (!interaction.member.roles.cache.has(leaderRoleId)) {
    await interaction.reply('Necesitas ser líder de gimnasio para usar este comando.');
    return;
  }

  if(!logChannelId) {
    await interaction.reply('No se ha configurado el canal de bitácora. Usa el comando **/set-channel** para configurarlo.');
    return;
  }

  // Verificar si el comando se está usando en el canal log
  if (interaction.channel.id !== logChannelId) {
    await interaction.reply('Este comando solo puede ser ejecutado en el canal de bitácora.');
    return;
  }

  try {
    const leaderProfile = await User.findById(interaction.user.id);

    if (!leaderProfile) {
      throw new Error("'¿Un líder de gimnasio sin medalla? 🤔'");
    }

    const user = await User.findById(losingUser.id);
    if (!user) {
      throw new Error("El usuario no tiene un perfil.");
    }

    if (!user.registered) {
      throw new Error("El retador no está registrado en la liga.");
    }

    if (user.tryDay >= 2) {
      throw new Error(
        "El retador ya ha realizado sus dos intentos de hoy, lee el registro nmms."
      );
    }

    user.tryDay += 1;
    await user.save();

    leaderProfile.wins += 1;
    await leaderProfile.save();

    await interaction.reply(
      `¡${interaction.user.username} ha defendido su gimnasio! El retador ${losingUser.username} ha perdido.`
    );
  } catch (error) {
    await interaction.reply(error.message);
  }
}

export default { data, execute };