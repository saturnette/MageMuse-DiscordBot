import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import axios from "axios";
import User from "../../models/user.model.js";
import { rollChannelOnly } from "../../middlewares/channel.middleware.js";

const cooldowns = new Map();

const data = new SlashCommandBuilder()
  .setName("roll-pokemon")
  .setDescription("Obtén un paquete de 10 Pokémon por 40 coins.");

const probabilities = {
  10: 0.7, 11: 0.4, 12: 0.2, 13: 0.7, 14: 0.4, 15: 0.2, 16: 0.7, 17: 0.4, 18: 0.2, 19: 0.7,
  20: 0.4, 21: 0.7, 22: 0.4, 23: 0.7, 24: 0.4, 27: 0.7, 28: 0.3, 29: 0.7, 30: 0.5, 32: 0.7,
  33: 0.5, 35: 0.7, 37: 0.4, 39: 0.7, 41: 0.7, 42: 0.5, 43: 0.7, 44: 0.3, 46: 0.7, 47: 0.4,
  48: 0.7, 49: 0.4, 50: 0.7, 51: 0.3, 52: 0.7, 53: 0.2, 54: 0.7, 55: 0.4, 56: 0.7, 57: 0.4,
  58: 0.4, 60: 0.7, 61: 0.4, 63: 0.5, 64: 0.2, 66: 0.7, 67: 0.4, 69: 0.7, 70: 0.4, 72: 0.7,
  73: 0.3, 74: 0.7, 75: 0.4, 77: 0.5, 78: 0.3, 79: 0.5, 80: 0.3, 81: 0.7, 82: 0.4, 83: 0.2,
  84: 0.6, 85: 0.3, 86: 0.5, 87: 0.3, 88: 0.7, 89: 0.3, 90: 0.6, 92: 0.7, 93: 0.4, 95: 0.5,
  96: 0.7, 97: 0.5, 98: 0.7, 99: 0.4, 100: 0.7, 101: 0.4, 102: 0.7, 104: 0.6, 105: 0.3,
  108: 0.5, 109: 0.6, 110: 0.3, 111: 0.5, 112: 0.2, 113: 0.2, 114: 0.5, 115: 0.4, 116: 0.5,
  117: 0.2, 118: 0.5, 119: 0.4, 120: 0.5, 122: 0.2, 123: 0.2, 124: 0.2, 125: 0.7, 126: 0.7, 127: 0.2,
  128: 0.2, 129: 0.7, 130: 0.3, 131: 0.3, 132: 0.3, 133: 0.5, 137: 0.4
};

const redExclusive = [23, 24, 58, 59, 43, 44, 45, 56, 57, 123, 125];
const blueExclusive = [27, 28, 37, 38, 69, 70, 71, 52, 53, 126, 127];
const starters = [1, 4, 7];

async function execute(interaction) {
  const userId = interaction.user.id;

  // Verificar cooldown
  const now = Date.now();
  const cooldownAmount = 60 * 1000; // 1 minuto en milisegundos

  if (cooldowns.has(userId)) {
    const expirationTime = cooldowns.get(userId) + cooldownAmount;

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

  cooldowns.set(userId, now);

  const user = await User.findById(interaction.user.id);

  if (!user.catcher) {
    await interaction.reply("Debes registrarte usando **/register-palette-dex** antes de usar este comando.");
    return;
  }

  if (user.coins < 40) {
    await interaction.reply("No tienes suficientes coins. Necesitas al menos 40 coins para obtener un paquete de 10 Pokémon.");
    return;
  }

  const favoriteColor = user.favoriteColor;
  const exclusivePokemon = favoriteColor === "red" ? redExclusive : blueExclusive;

  function weightedRandomSelection() {
    const probabilityGroups = {
      0.7: [],
      0.4: [],
      0.3: [],
      0.5: [],
      0.6: [],
      0.2: []
    };

    for (const [id, probability] of Object.entries(probabilities)) {
      const pokemonId = parseInt(id);
      // Excluir starters y exclusivos del color opuesto
      if (!starters.includes(pokemonId) && !exclusivePokemon.includes(pokemonId)) {
        probabilityGroups[probability].push(pokemonId);
      }
    }

    const randomProbability = Math.random();

    if (randomProbability < 0.95) {  
      const group07 = probabilityGroups[0.7];
      return group07[Math.floor(Math.random() * group07.length)];
    } else if (randomProbability < 0.97) {  
      const group04 = probabilityGroups[0.4];
      return group04[Math.floor(Math.random() * group04.length)];
    } else if (randomProbability < 0.98) {  
      const group05 = probabilityGroups[0.5].concat(probabilityGroups[0.6]);
      return group05[Math.floor(Math.random() * group05.length)];
    } else if (randomProbability < 0.99) {  
      const group03 = probabilityGroups[0.3];
      return group03[Math.floor(Math.random() * group03.length)];
    } else {  
      const group02 = probabilityGroups[0.2];
      return group02[Math.floor(Math.random() * group02.length)];
    }
  }

  const pokemonPack = [];
  const pokemonNames = [];
  let apiError = false;

  for (let i = 0; i < 10; i++) {
    const randomId = weightedRandomSelection();

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`, { timeout: 5000 });
      const pokemonName = response.data.name.charAt(0).toUpperCase() + response.data.name.slice(1);
      const pokemonImage = response.data.sprites.other["official-artwork"].front_default;
      pokemonPack.push({ id: randomId, name: pokemonName, image: pokemonImage });
      pokemonNames.push(pokemonName);
    } catch (error) {
      console.error(`Error al obtener el Pokémon con ID ${randomId}:`, error.message);
      pokemonNames.push(`ID ${randomId}`);
      apiError = true;
    }
  }

  if (apiError) {
    await interaction.reply({
      content: `Hubo un problema al obtener algunos Pokémon. Aquí tienes los nombres:\n${pokemonNames.join(", ")}`,
      ephemeral: true,
    });
    return;
  }

  try {
    const newPokemonPack = [];
    for (const pokemon of pokemonPack) {
      const existingPokemon = user.pokemonCollection.find(p => p.number === pokemon.id);
      if (existingPokemon) {
        existingPokemon.count += 1;
        newPokemonPack.push({ ...pokemon, count: existingPokemon.count });
      } else {
        user.pokemonCollection.push({ number: pokemon.id, name: pokemon.name, count: 1 });
        newPokemonPack.push({ ...pokemon, count: 1, isNew: true });
      }
    }

    let currentIndex = 0;

    const generateEmbed = (index) => {
      if (index < 10) {
        const pokemon = newPokemonPack[index];
        const title = pokemon.isNew
          ? `**#${pokemon.id} ${pokemon.name}** (New 🎀)`
          : `**#${pokemon.id} ${pokemon.name}** (x${pokemon.count})`;
        return new EmbedBuilder()
          .setColor(0xffbf00)
          .setTitle(title)
          .setImage(pokemon.image)
          .setFooter({ text: `Pokémon ${index + 1} de 10` });
      } else {
        return new EmbedBuilder()
          .setColor(0xffbf00)
          .setTitle(`¡Lista de Pokémon obtenidos!`)
          .setDescription(newPokemonPack.map((p, i) => p.isNew
            ? `**#${p.id} ${p.name}** (New 🎀)`
            : `**#${p.id} ${p.name}** (x${p.count})`).join("\n"))
          .setFooter({ text: `Resumen` });
      }
    };

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('➡️')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ embeds: [generateEmbed(currentIndex)], components: [row] });
    const message = await interaction.fetchReply();

    // Si el embed se muestra correctamente, restar las monedas
    const updatedUser = await User.findOneAndUpdate(
      { _id: interaction.user.id, coins: { $gte: 40 } },
      { $inc: { coins: -40 }, $set: { pokemonCollection: user.pokemonCollection } },
      { new: true }
    );

    if (!updatedUser) {
      await interaction.followUp("No tienes suficientes coins. Necesitas al menos 40 coins para obtener un paquete de 10 Pokémon.");
      return;
    }

    const filter = i => i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'prev') {
        currentIndex = (currentIndex === 0) ? 10 : currentIndex - 1;
      } else if (i.customId === 'next') {
        currentIndex = (currentIndex === 10) ? 0 : currentIndex + 1;
      }
      await i.update({ embeds: [generateEmbed(currentIndex)], components: [row] });
    });

    collector.on('end', collected => {
      message.edit({ components: [] });
    });

  } catch (error) {
    console.error(error);
    await interaction.reply("Hubo un error al agregar el paquete de Pokémon a tu equipo.");
  }
}

export default { data, execute: rollChannelOnly(execute) };