import User from "../../../models/user.model.js";
import { logChannelOnly } from "../../../middlewares/channel.middleware.js";
import { leaderRoleOnly } from "../../../middlewares/rol.middleware.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { generateAndSaveProfileImage } from "../../../utils/image-generator.js";
import fetch from "node-fetch"; 

const cooldowns = new Map(); 

const data = new SlashCommandBuilder()
  .setName("set-badge")
  .setDescription("¡Otorga una medalla a un entrenador si gana el Bo3!")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario que está desafiando.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("result")
      .setDescription("¿Ganaste o perdiste?")
      .setRequired(true)
      .addChoices(
        { name: "Yo gané :)", value: "win" },
        { name: "Yo perdí :(", value: "lose" }
      )
  );

async function execute(interaction) {
  await interaction.deferReply();

  const recipientUser = interaction.options.getUser("user");
  const result = interaction.options.getString("result"); // Obtener el resultado como "win" o "lose"
  const leaderId = interaction.user.id;

  // Verificar el tiempo de espera
  const now = Date.now();
  const cooldown = cooldowns.get(leaderId);

  if (cooldown && now - cooldown < 60000) {
    // 60000 ms = 1 minuto
    const remainingTime = Math.ceil((60000 - (now - cooldown)) / 1000);
    await interaction.followUp(
      `Debes esperar ${remainingTime} segundos antes de volver a usar este comando.`
    );
    return;
  }

  // Registrar el tiempo actual en el mapa de cooldowns
  cooldowns.set(leaderId, now);

  try {
    const challenger = await User.findById(recipientUser.id);
    const leader = await User.findById(leaderId);

    if (!challenger || !leader) {
      throw new Error("No se encontró el perfil del líder o del retador.");
    }

    if (!challenger.registered) {
      throw new Error("El retador no está registrado.");
    }

    if (challenger.tryDay >= 5) {
      throw new Error(
        "El retador ya ha realizado sus cinco intentos de hoy. Tiene que esperar hasta mañana, batalla inválida, el líder decide si se cuenta o no."
      );
    }

    // Inicializar el progreso del Bo3 para este líder si no existe
    if (!challenger.bo3Progress.has(leaderId)) {
      challenger.bo3Progress.set(leaderId, {
        leaderWins: 0,
        challengerWins: 0,
        completed: false,
      });
    }

    const bo3 = challenger.bo3Progress.get(leaderId);

    // Verificar si el retador ya ganó el Bo3
    if (bo3.completed) {
      await interaction.followUp(
        `¡<@${recipientUser.id}> ya ganó el Bo3 contra <@${leaderId}> y tiene la medalla!`
      );
      return;
    }

    // Actualizar el marcador del Bo3
    if (result === "win") {
      bo3.leaderWins += 1;
    } else if (result === "lose") {
      bo3.challengerWins += 1;
    }

    // Incrementar el contador de intentos del retador
    challenger.tryDay += 1;

    // Clonar y actualizar bo3Progress
    const updatedBo3Progress = new Map(challenger.bo3Progress);
    updatedBo3Progress.set(leaderId, bo3);
    challenger.bo3Progress = updatedBo3Progress;

    // Indicar que bo3Progress fue modificado
    challenger.markModified("bo3Progress");

    // Verificar si alguien ganó el Bo3
    if (bo3.leaderWins === 2) {
      // El líder gana el Bo3
      updatedBo3Progress.set(leaderId, {
        leaderWins: 0,
        challengerWins: 0,
        completed: false,
      });
      challenger.bo3Progress = updatedBo3Progress;
      challenger.markModified("bo3Progress");
      leader.wins += 1;

      await leader.save();
      await challenger.save();

      await interaction.followUp(
        `¡<@${leaderId}> ha ganado el Bo3 contra <@${recipientUser.id}> y ha defendido su gimnasio! Tremenda cabra 🐐.`
      );
      return;
    } else if (bo3.challengerWins === 2) {
      // El retador gana el Bo3 y obtiene la medalla
      bo3.completed = true; // Marcar el Bo3 como completado
      bo3.leaderWins = 0;
      bo3.challengerWins = 0;

      updatedBo3Progress.set(leaderId, bo3);
      challenger.bo3Progress = updatedBo3Progress;
      challenger.markModified("bo3Progress");

      const badgeGiven = await giveBadge(
        recipientUser.id,
        leader.badgeName,
        leader.badgeType
      );

      if (badgeGiven) {
        leader.loses += 1;

        // Verificar el número de medallas del retador
        const numBadges = challenger.badges.length;

        let extraMessage = "";

        if (numBadges === 5) {
          // Agregar Mewtwo a la colección
          challenger.pokemonCollection.push({
            number: 150,
            name: "Mewtwo",
            count: 1,
          });
          extraMessage +=
            " ¡Has obtenido un **Mewtwo** por alcanzar 5 medallas!";
          await sendPokemonEmbed(interaction, "Mewtwo", 150);
        }

        if (numBadges === 8) {
          // Otorgar un ticket al Alto Mando
          challenger.tryEF += 1;
          extraMessage +=
            " ¡Has obtenido un **ticket** 🎫 para retar al Alto Mando!";
        }

        if (numBadges === 10) {
          // Agregar Mew a la colección y otorgar otro ticket
          challenger.pokemonCollection.push({
            number: 151,
            name: "Mew",
            count: 1,
          });
          challenger.tryEF += 1;
          extraMessage +=
            " ¡Has obtenido un **Mew** ✨ y otro **ticket** 🎫 para retar al Alto Mando! Haz completado las 10 medallas ¡Eres un gran entrenador!";
          await sendPokemonEmbed(interaction, "Mew", 151);
        }

        await leader.save();
        await challenger.save();
        await generateAndSaveProfileImage(recipientUser.id);

        await interaction.followUp(
          `¡<@${recipientUser.id}> ha ganado el Bo3 contra <@${leaderId}> y ha obtenido la medalla **${leader.badgeName}**! Un paso más para ser campeón de liga 🐢. ${extraMessage}`
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
      `Marcador actualizado: <@${leaderId}> (${bo3.leaderWins}) - <@${recipientUser.id}> (${bo3.challengerWins}).`
    );
  } catch (error) {
    console.error(error);
    await interaction.followUp(error.message);
  }
}

async function sendPokemonEmbed(interaction, pokemonName, pokemonNumber) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`
    );
    const data = await response.json();
    const spriteUrl = data.sprites.front_default;

    const embed = new EmbedBuilder()
      .setTitle(`¡Has obtenido a ${pokemonName}!`)
      .setImage(spriteUrl)
      .setColor(0xffcc00)
      .setFooter({
        text: "¡Sigue coleccionando medallas para obtener más recompensas!",
      });

    await interaction.followUp({ embeds: [embed] });
  } catch (error) {
    console.error(`Error al obtener el sprite de ${pokemonName}:`, error);
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
