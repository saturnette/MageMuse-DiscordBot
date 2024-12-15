import User from "../../models/user.model.js";
import { ladderChannelOnly } from "../../middlewares/channel.middleware.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { generateLeaderboardImage } from "../../utils/leaderboard-generator.js";

const cooldowns = new Map();

const data = new SlashCommandBuilder()
  .setName("set-ladder-result")
  .setDescription("¡Registra tu victoria!")
  .addUserOption((option) =>
    option
      .setName("perdedor")
      .setDescription("El usuario al que venciste")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("replay")
      .setDescription("El enlace de la repetición")
      .setRequired(true)
  );

async function execute(interaction) {
  const winner = interaction.user; // El ganador es quien ejecuta el comando
  const loser = interaction.options.getUser("perdedor");
  const replayLink = interaction.options.getString("replay");

  const now = Date.now();
  const cooldownAmount = 120 * 1000; // 1 minuto en milisegundos

  if (cooldowns.has(winner.id)) {
    const expirationTime = cooldowns.get(winner.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      await interaction.reply({
        content: `Por favor, espera ${timeLeft.toFixed(1)} segundos antes de usar este comando nuevamente.`,
        ephemeral: true,
      });
      return;
    }
  }

  cooldowns.set(winner.id, now);

  const showdownReplayRegex =
    /^https:\/\/replay\.pokemonshowdown\.com\/[a-z0-9-]+$/;
  if (!showdownReplayRegex.test(replayLink)) {
    await interaction.reply({
      content: "Por favor, proporciona un enlace válido de Showdown Replay.",
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({ content: "Ingresando datos...", fetchReply: true });

  if (winner.id === loser.id) {
    await interaction.editReply(
      "No puedes registrar una victoria contra ti mismo."
    );
    return;
  }

  try {
    const winnerUser = await User.findOneAndUpdate(
      { _id: winner.id },
      { $setOnInsert: { elo: 1000, winsLadder: 0, lossesLadder: 0 } },
      { upsert: true, new: true }
    );
    const loserUser = await User.findOneAndUpdate(
      { _id: loser.id },
      { $setOnInsert: { elo: 1000, winsLadder: 0, lossesLadder: 0 } },
      { upsert: true, new: true }
    );

    if (!winnerUser.showdownNick || !loserUser.showdownNick) {
      await interaction.editReply(
        "No voy a registrar esa mamada, ambos usuarios deben tener una cuenta de showdown registrada para participar."
      );
      return;
    }

    if (!winnerUser.allowChallenges || !loserUser.allowChallenges) {
      await interaction.editReply(
        "Uno de los usuarios está baneado y no puede participar en desafíos."
      );
      return;
    }

    const elow = winnerUser.elo;
    const elol = loserUser.elo;

    await updateElo(winnerUser._id, loserUser._id);

    // Incrementar winsLadder y lossesLadder
    winnerUser.winsLadder += 1;
    loserUser.lossesLadder += 1;
    await winnerUser.save();
    await loserUser.save();

    const winnerUse = await User.findById(winnerUser._id);
    const loserUse = await User.findById(loserUser._id);

    const embed = new EmbedBuilder()
      .setColor(0xffbf00)
      .setTitle(`Resultado: ${winner.username} Vs. ${loser.username}`)
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL(),
      })
      .addFields(
        {
          name: "Cambio de Elo",
          value: `${winner.username}: + ${winnerUse.elo - elow}\n${
            loser.username
          }: - ${elol - loserUse.elo}`,
        },
        { name: "Replay", value: `[Ver repetición](${replayLink})` }
      );

    await interaction.editReply({
      content: "¡Victoria registrada!",
      embeds: [embed],
    });

    // Generar y guardar la imagen del perfil después de actualizar la interacción
    await generateLeaderboardImage(interaction.client);
  } catch (error) {
    console.error(error);
    await interaction.followUp("Ha ocurrido un error actualizando el elo.");
  }
}

async function updateElo(winnerId, loserId) {
  const winner = await User.findById(winnerId);
  const loser = await User.findById(loserId);

  const kWinner = getKFactor(winner.elo);
  const kLoser = getKFactor(loser.elo);

  const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
  const expectedLoser = 1 - expectedWinner;

  winner.elo = parseInt(
    Math.round(winner.elo + kWinner * (1 - expectedWinner)),
    10
  );
  loser.elo = parseInt(
    Math.round(loser.elo + kLoser * (0 - expectedLoser)),
    10
  );

  if (winner.elo < 1000) winner.elo = 1000;
  if (loser.elo < 1000) loser.elo = 1000;

  await winner.save();
  await loser.save();
}

function getKFactor(elo) {
  if (elo < 1100) {
    return 80 - (30 * (elo - 1000)) / 100;
  } else if (elo < 1300) {
    return 50;
  } else if (elo < 1600) {
    return 40;
  } else {
    return 32;
  }
}

export default { data, execute: ladderChannelOnly(execute) };