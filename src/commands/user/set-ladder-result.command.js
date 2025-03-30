import User from "../../models/user.model.js";
import { ladderChannelOnly } from "../../middlewares/channel.middleware.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { generateLeaderboardImage } from "../../utils/leaderboard-generator.js";
import axios from "axios";

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

const specialEvolutions = [93, 75, 64, 67, 37, 58, 133, 61, 90, 44, 70, 25];

async function execute(interaction) {
  const winner = interaction.user;
  const loser = interaction.options.getUser("perdedor");
  const replayLink = interaction.options.getString("replay");

  const now = Date.now();
  const cooldownAmount = 120 * 1000;

  if (cooldowns.has(winner.id)) {
    const expirationTime = cooldowns.get(winner.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      await interaction.reply({
        content: `Por favor, espera ${timeLeft.toFixed(
          1
        )} segundos antes de usar este comando nuevamente.`,
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
      {
        $setOnInsert: {
          elo: 1000,
          winsLadder: 0,
          lossesLadder: 0,
          gamesPlayed: 0,
          coins: 0,
        },
      },
      { upsert: true, new: true }
    );
    const loserUser = await User.findOneAndUpdate(
      { _id: loser.id },
      {
        $setOnInsert: {
          elo: 1000,
          winsLadder: 0,
          lossesLadder: 0,
          gamesPlayed: 0,
          coins: 0,
        },
      },
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

    winnerUser.winsLadder += 1;
    loserUser.lossesLadder += 1;
    winnerUser.gamesPlayed += 1;
    loserUser.gamesPlayed += 1;

    // Incrementar el número de batallas del Pokémon compañero
    if (winnerUser.companionPokemon) {
      winnerUser.companionBattles += 1;

      if (winnerUser.companionBattles === 3) {
        await interaction.followUp(
          `${winnerUser.companionPokemon.name} se está haciendo demasiado fuerte.`
        );
      }

      if (winnerUser.companionBattles === 5) {
        const companionNumber = winnerUser.companionPokemon.number;
        if (!specialEvolutions.includes(companionNumber)) {
          const evolution = await getEvolution(companionNumber);
          if (evolution) {
            const originalName = winnerUser.companionPokemon.name;
            winnerUser.companionPokemon = {
              number: evolution.number,
              name: evolution.name,
              count: 1,
            };
            winnerUser.companionBattles = 0;

            const existingPokemon = winnerUser.pokemonCollection.find(
              (p) => p.number === evolution.number
            );
            if (existingPokemon) {
              existingPokemon.count += 1;
            } else {
              winnerUser.pokemonCollection.push({
                number: evolution.number,
                name: evolution.name,
                count: 1,
              });
            }
            // Obtener el sprite del Pokémon evolucionado
            const spriteUrl = await getPokemonSprite(evolution.number);

            await interaction.followUp({
              embeds: [
                new EmbedBuilder()
                  .setColor(0xffbf00)
                  .setTitle(`¡Evolución!`)
                  .setDescription(
                    `¡Tu ${originalName} ha evolucionado a ${evolution.name}!`
                  )
                  .setImage(spriteUrl),
              ],
            });
          }
        }
      }
    }

    const winnerUse = await User.findById(winnerUser._id);
    const loserUse = await User.findById(loserUser._id);

    // Modificar la lógica de coins para que siempre se ganen/perdieran 40 Pokecoins
    const coinsToAdd = 40;
    const coinsToSubtract = 40;

    winnerUser.coins += coinsToAdd;

    // Asegurarse de que las coins del perdedor no bajen de cero
    loserUser.coins = Math.max(0, loserUser.coins - coinsToSubtract);

    const winnerEloGain = winnerUse.elo - elow;
    const loserEloDrop = elol - loserUse.elo;

    await winnerUser.save();
    await loserUser.save();

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
          value: `${winner.username}: +${winnerEloGain}\n${loser.username}: -${loserEloDrop}`,
        },
        {
          name: "Pokecoins",
          value: `${winner.username} ganó 40 Pokecoins, ahora tiene ${winnerUser.coins}.\n${loser.username} perdió 40 Pokecoins, ahora tiene ${loserUser.coins}.`,
        },
        { name: "Replay", value: `[Ver repetición](${replayLink})` }
      );

    await interaction.editReply({
      content: "¡Victoria registrada!",
      embeds: [embed],
    });

    await generateLeaderboardImage(interaction.client);
  } catch (error) {
    console.error(error);
    await interaction.followUp("Ha ocurrido un error actualizando el elo.");
  }
}

async function getEvolution(pokemonNumber) {
  try {
    const speciesResponse = await axios.get(
      `https://pokeapi.co/api/v2/pokemon-species/${pokemonNumber}`
    );
    const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
    const evolutionChainResponse = await axios.get(evolutionChainUrl);
    const chain = evolutionChainResponse.data.chain;

    let current = chain;
    while (current) {
      if (current.species.url.endsWith(`/${pokemonNumber}/`)) {
        if (current.evolves_to.length > 0) {
          const evolution = current.evolves_to[0].species;
          const evolutionNumber = parseInt(
            evolution.url.split("/").slice(-2, -1)[0]
          );
          const evolutionName =
            evolution.name.charAt(0).toUpperCase() + evolution.name.slice(1);
          return { number: evolutionNumber, name: evolutionName };
        }
        break;
      }
      current = current.evolves_to[0];
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}

async function getPokemonSprite(pokemonNumber) {
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`
    );
    return response.data.sprites.front_default;
  } catch (error) {
    console.error(error);
    return null;
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
  if (loser.elo < loser.eloLimit) loser.elo = loser.eloLimit;

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