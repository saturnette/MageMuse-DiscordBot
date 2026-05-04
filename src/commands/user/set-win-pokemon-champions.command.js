import User from "../../models/user.model.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { generateLeaderboardImage } from "../../utils/leaderboard-generator.js";
import axios from "axios";

const cooldowns = new Map();

const data = new SlashCommandBuilder()
  .setName("set-win-pokemon-champions")
  .setDescription("¡Registra tu victoria en Pokemon Champions!")
  .addUserOption((option) =>
    option
      .setName("perdedor")
      .setDescription("El usuario al que venciste")
      .setRequired(true)
  );

const specialEvolutions = [93, 75, 64, 67, 37, 58, 133, 61, 90, 44, 70, 25];

async function execute(interaction) {
  const winner = interaction.user;
  const loser = interaction.options.getUser("perdedor");

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
          wins: 0,
          loses: 0,
          coins: 0,
        },
      },
      { upsert: true, new: true }
    );
    const loserUser = await User.findOneAndUpdate(
      { _id: loser.id },
      {
        $setOnInsert: {
          wins: 0,
          loses: 0,
          coins: 0,
        },
      },
      { upsert: true, new: true }
    );

    if (!winnerUser.pokemonChampionsNick || !loserUser.pokemonChampionsNick || !winnerUser.pokemonChampionsFriendCode || !loserUser.pokemonChampionsFriendCode) {
      await interaction.editReply(
        "No voy a registrar esa mamada, ambos usuarios deben tener una cuenta de Pokemon Champions registrada para participar."
      );
      return;
    }

    if (!winnerUser.allowChallenges || !loserUser.allowChallenges) {
      await interaction.editReply(
        "Uno de los usuarios está baneado y no puede participar en desafíos."
      );
      return;
    }

    winnerUser.wins += 1;
    loserUser.loses += 1;

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
    
    let coinsToAdd = 40;
    let coinsToSubtract = 40;
    
    // Si el ganador tiene más de 1000 coins, solo gana 10
    if (winnerUser.coins > 1000) {
      coinsToAdd = 10;
    }
    
    // Si el perdedor tiene más de 1000 coins, pierde 500 en lugar de 40
    if (loserUser.coins > 1000) {
      coinsToSubtract = 500;
    }
    
    winnerUser.coins += coinsToAdd;
    
    // Asegurarse de que las coins del perdedor no bajen de cero
    loserUser.coins = Math.max(0, loserUser.coins - coinsToSubtract);
    
    const winnerWins = winnerUser.wins;
    const loserLoses = loserUser.loses;
    
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
          name: "Estadísticas",
          value: `${winner.username}: ${winnerWins} victorias\n${loser.username}: ${loserLoses} derrotas`,
        }
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
