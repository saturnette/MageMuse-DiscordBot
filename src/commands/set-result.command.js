import User from "../models/user.model.js";

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("set-result")
  .setDescription("¡Registra el resultado de la batalla!")
  .addUserOption((option) =>
    option
      .setName("ganador")
      .setDescription("El usuario ganador")
      .setRequired(true)
  )
  .addUserOption((option) =>
    option
      .setName("perdedor")
      .setDescription("El usuario perdedor")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("replay")
      .setDescription("El enlace de la repetición")
      .setRequired(true)
  );

async function execute(interaction) {
  const winner = interaction.options.getUser("ganador");
  const loser = interaction.options.getUser("perdedor");
  const replayLink = interaction.options.getString("replay");

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
    await interaction.reply(
      "El ganador y el perdedor no pueden ser el mismo."
    );
    return;
  }

  try {
    const winnerUser = await User.findOneAndUpdate(
      { _id: winner.id },
      { $setOnInsert: { elo: 1000 } },
      { upsert: true, new: true }
    );
    const loserUser = await User.findOneAndUpdate(
      { _id: loser.id },
      { $setOnInsert: { elo: 1000 } },
      { upsert: true, new: true }
    );

    if (!winnerUser.allowChallenges || !loserUser.allowChallenges) {
      await interaction.reply(
        "Uno de los usuarios está baneado y no puede recibir desafíos."
      );
      return;
    }

    const elow = winnerUser.elo;
    const elol = loserUser.elo;

    await updateElo(winnerUser._id, loserUser._id);

    const winnerUse = await User.findById(winnerUser._id);
    const loserUse = await User.findById(loserUser._id);

    const embed = new EmbedBuilder()
      .setColor(0xffbf00)
      .setTitle(`Resultado: ${winner.username} Vs. ${loser.username}`)
      .setAuthor({
        name: "Pueblo Paleta",
        iconURL:
          "https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/templates%2Fpueblopaletaservericon.png?alt=media&token=18bb0709-7636-4483-baf1-5906b0a81adc",
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
      content: "¡Resultados actualizados!",
      embeds: [embed],
    });
  } catch (error) {
    console.error(error);
    await interaction.reply("Ha ocurrido un error actualizando el elo.");
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

export default { data, execute };
