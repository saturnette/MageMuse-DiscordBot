import User from "../../../models/user.model.js";
import Role from "../../../models/role.model.js";
import Channel from "../../../models/channel.model.js";
import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("set-badge")
  .setDescription("¡Otorga una medalla a un entrenador!")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario que recibirá la medalla.")
      .setRequired(true)
  );

async function execute(interaction) {
  // Obtener el rol leader de la base de datos
  const roleData = await Role.findOne({});
  const leaderRoleId = roleData?.leader;

  // Obtener el canal log de la base de datos
  const channelData = await Channel.findOne({});
  const logChannelId = channelData?.log;

  // Verificar si el usuario tiene el rol leader
  if (!interaction.member.roles.cache.has(leaderRoleId)) {
    await interaction.reply('Solo los líderes de gimnasio pueden otorgar medallas.');
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

  const recipientUser = interaction.options.getUser("user");

  try {
    const leaderProfile = await User.findById(interaction.user.id);

    if (!leaderProfile || !leaderProfile.badgeName) {
      throw new Error("¿Un líder de gimnasio sin medalla? 🤔");
    }

    const user = await User.findById(recipientUser.id);
    if (!user) {
      throw new Error("El usuario no tiene un perfil.");
    }

    if (!user.registered) {
      throw new Error("El retador no está registrado.");
    }

    if (user.tryDay >= 2) {
      throw new Error(
        "El retador ya ha realizado sus dos intentos de hoy, lee el registro nmms."
      );
    }

    const badgeGiven = await giveBadge(
      recipientUser.id,
      leaderProfile.badgeName,
      leaderProfile.badgeType
    );

    leaderProfile.loses += 1;
    await leaderProfile.save();

    const userBadges = await User.findById(recipientUser.id);
    const numBadges = userBadges.badges.length;

    let replyMessage = "";

    if (badgeGiven && numBadges === 8) {
      userBadges.tryEF += 1;
      userBadges.save();
      replyMessage = `¡${recipientUser.username} ha obtenido la medalla ${leaderProfile.badgeName} de ${interaction.user.username}! Además, ¡ahora tiene un ticket 🎫 para retar al Alto Mando!`;
    } else if (badgeGiven && numBadges === 10) {
      userBadges.tryEF += 1;
      userBadges.save();
      replyMessage = `¡${recipientUser.username} ha obtenido la medalla ${leaderProfile.badgeName} de ${interaction.user.username}! ¡Ha conseguido todas las medallas, que hazaña 🎉!, además, ¡obtiene un nuevo ticket 🎫 para retar al Alto Mando!`;
    } else if (badgeGiven) {
      replyMessage = `¡${recipientUser.username} ha obtenido la medalla ${leaderProfile.badgeName} de ${interaction.user.username}!`;
    } else {
      replyMessage = `¡${recipientUser.username} ya tiene la medalla ${leaderProfile.badgeName}!`;
    }

    await interaction.reply(replyMessage);
  } catch (error) {
    await interaction.reply(error.message);
  }
}

async function giveBadge(userId, badgeName, badgeType) {
  const user = (await User.findById(userId)) || new User({ _id: userId });

  if (!user.badges.some((badge) => badge.badgeName === badgeName)) {
    user.badges.push({ badgeName: badgeName, badgeType: badgeType });

    user.tryDay += 1;

    await user.save();

    return true;
  }

  return false;
}

export default { data, execute };