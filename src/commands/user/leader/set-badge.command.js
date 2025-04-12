import User from "../../../models/user.model.js";
import { logChannelOnly } from "../../../middlewares/channel.middleware.js";
import { leaderRoleOnly } from "../../../middlewares/rol.middleware.js";
import { SlashCommandBuilder } from "discord.js";
import { generateAndSaveProfileImage } from "../../../utils/image-generator.js";

const data = new SlashCommandBuilder()
  .setName("set-badge")
  .setDescription("¡Otorga una medalla a un entrenador si gana el Bo3!")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario que está desafiando.")
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("leader-win")
      .setDescription("¿El líder ganó esta partida?")
      .setRequired(true)
  );

async function execute(interaction) {
  await interaction.deferReply();

  const recipientUser = interaction.options.getUser("user");
  const leaderWin = interaction.options.getBoolean("leader-win");

  try {
    const challenger = await User.findById(recipientUser.id);
    const leader = await User.findById(interaction.user.id);

    if (!challenger || !leader) {
      throw new Error("No se encontró el perfil del líder o del retador.");
    }

    if (!challenger.registered) {
      throw new Error("El retador no está registrado.");
    }

    if (challenger.tryDay >= 5) {
      throw new Error("El retador ya ha realizado sus cinco intentos de hoy.");
    }

    // Actualizar el marcador del Bo3
    if (leaderWin) {
      leader.bo3LeaderWins += 1;
    } else {
      challenger.bo3ChallengerWins += 1;
    }

    // Verificar si alguien ganó el Bo3
    if (leader.bo3LeaderWins === 2) {
      // El líder gana el Bo3
      leader.bo3LeaderWins = 0;
      challenger.bo3ChallengerWins = 0;
      challenger.tryDay += 1; // Incrementar intentos del retador
      await leader.save();
      await challenger.save();

      await interaction.followUp(
        `¡<@${interaction.user.id}> ha ganado el Bo3 contra <@${recipientUser.id}>! El contador del retador se ha reiniciado.`
      );
      return;
    } else if (challenger.bo3ChallengerWins === 2) {
      // El retador gana el Bo3 y obtiene la medalla
      leader.bo3LeaderWins = 0;
      challenger.bo3ChallengerWins = 0;

      const badgeGiven = await giveBadge(
        recipientUser.id,
        leader.badgeName,
        leader.badgeType
      );

      if (badgeGiven) {
        leader.loses += 1;
        await leader.save();
        await generateAndSaveProfileImage(recipientUser.id);

        await interaction.followUp(
          `¡<@${recipientUser.id}> ha ganado el Bo3 contra <@${interaction.user.id}> y ha obtenido la medalla **${leader.badgeName}**!`
        );
      } else {
        await interaction.followUp(
          `¡<@${recipientUser.id}> ya tiene la medalla **${leader.badgeName}**!`
        );
      }
      return;
    }

    // Guardar los cambios si aún no se ha decidido el Bo3
    await leader.save();
    await challenger.save();

    await interaction.followUp(
      `Marcador actualizado: <@${interaction.user.id}> (${leader.bo3LeaderWins}) - <@${recipientUser.id}> (${challenger.bo3ChallengerWins}).`
    );
  } catch (error) {
    console.error(error);
    await interaction.followUp(error.message);
  }
}

async function giveBadge(userId, badgeName, badgeType) {
  const user = (await User.findById(userId)) || new User({ _id: userId });

  if (!user.badges.some((badge) => badge.badgeName === badgeName)) {
    user.badges.push({ badgeName: badgeName, badgeType: badgeType });
    await user.save();
    return true;
  }

  return false;
}

export default { data, execute: leaderRoleOnly(logChannelOnly(execute)) };