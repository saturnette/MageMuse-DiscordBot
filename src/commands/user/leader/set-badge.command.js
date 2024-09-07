import User from "../../../models/user.model.js";
import { logChannelOnly } from "../../../middlewares/channel.middleware.js";
import { leaderRoleOnly } from "../../../middlewares/rol.middleware.js";
import { SlashCommandBuilder } from "discord.js";
import { generateAndSaveProfileImage } from "../../../utils/image-generator.js";

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
  await interaction.deferReply(); // Defer the reply to give more time for processing

  const recipientUser = interaction.options.getUser("user");

  try {
    const user = await User.findById(recipientUser.id);
    if (!user) {
      throw new Error("El usuario no tiene un perfil.");
    }

    if (!user.registered) {
      throw new Error("El retador no está registrado.");
    }

    if (user.tryDay >= 2) {
      throw new Error(
        "El retador ya ha realizado sus dos intentos de hoy."
      );
    }

    const leaderProfile = await User.findById(interaction.user.id);

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
      await userBadges.save();
      replyMessage = `¡<@${recipientUser.id}> ha obtenido la medalla **${leaderProfile.badgeName}** de <@${interaction.user.id}>! Además, ¡ahora tiene un ticket 🎫 para retar al Alto Mando!`;
    } else if (badgeGiven && numBadges === 10) {
      userBadges.tryEF += 1;
      await userBadges.save();
      replyMessage = `¡<@${recipientUser.id}> ha obtenido la medalla **${leaderProfile.badgeName}** de <@${interaction.user.id}>! ¡Ha conseguido todas las medallas, que hazaña 🎉!, además, ¡obtiene un nuevo ticket 🎫 para retar al Alto Mando!`;
    } else if (badgeGiven) {
      replyMessage = `¡<@${recipientUser.id}> ha obtenido la medalla **${leaderProfile.badgeName}** de <@${interaction.user.id}>!`;
    } else {
      replyMessage = `¡<@${recipientUser.id}> ya tiene la medalla **${leaderProfile.badgeName}**!`;
    }

    await generateAndSaveProfileImage(recipientUser.id);

    await interaction.followUp(replyMessage);
  } catch (error) {
    console.error(error);
    await interaction.followUp(error.message);
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

export default { data, execute: leaderRoleOnly(logChannelOnly(execute)) };