import User from "../models/user.model.js";
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
  const recipientUser = interaction.options.getUser("user");

  try {
    const leaderProfile = await User.findById(interaction.user.id);

    if (!leaderProfile || !leaderProfile.badgeName) {
      throw new Error("No tienes permisos para ejecutar este comando.");
    }

    const user = await User.findById(recipientUser.id);
    if (!user) {
        throw new Error("El usuario no tiene un perfil");
      }
  
      if (!user.registered) {
        throw new Error("El retador no está registrado");
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
      userBadges.tryEF += 2;
      userBadges.save();
      replyMessage = `¡${recipientUser.username} ha obtenido la medalla ${leaderProfile.badgeName} de ${interaction.user.username}! Además, ¡ahora tienes dos pases para retar al Alto Mando!`;
    } else if (badgeGiven && numBadges === 10) {
      userBadges.tryEF += 1;
      userBadges.save();
      replyMessage = `¡${recipientUser.username} ha obtenido la medalla ${leaderProfile.badgeName} de ${interaction.user.username}! Además, ¡ahora tienes un nuevo pase para retar al Alto Mando!`;
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

  if (!user.badges.some((badge) => badge.name === badgeName)) {
    user.badges.push({ name: badgeName, badgeType: badgeType });

    user.tryDay += 1;

    await user.save();

    return true;
  }

  return false;
}

export default { data, execute };