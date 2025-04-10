import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("roll-pokemon-boost")
  .setDescription("Obtén un paquete de 5 Pokémon con probabilidades ajustadas según los coins ingresados.")
  .addIntegerOption(option =>
    option.setName("coins")
      .setDescription("Cantidad de coins a invertir (mínimo 40).")
      .setRequired(true)
  );

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

async function execute(interaction) {
  const userId = interaction.user.id;
  const coins = interaction.options.getInteger("coins");

  if (coins < 40) {
    await interaction.reply("Debes invertir al menos 40 coins para usar este comando.");
    return;
  }

  const user = await User.findById(userId);

  if (!user || user.coins < coins) {
    await interaction.reply("No tienes suficientes coins para usar este comando.");
    return;
  }

  // Ajustar probabilidades según los coins ingresados
  const boost = Math.min(coins / 1000, 0.3); // Máximo boost de 0.3
  const adjustedProbabilities = Object.fromEntries(
    Object.entries(probabilities).map(([id, prob]) => [id, Math.min(prob + boost, 1)])
  );

  function weightedRandomSelection() {
    const totalWeight = Object.values(adjustedProbabilities).reduce((sum, prob) => sum + prob, 0);
    const random = Math.random() * totalWeight;
    let cumulative = 0;

    for (const [id, prob] of Object.entries(adjustedProbabilities)) {
      cumulative += prob;
      if (random <= cumulative) {
        return parseInt(id);
      }
    }
  }

  const pokemonPack = [];
  for (let i = 0; i < 5; i++) {
    const randomId = weightedRandomSelection();
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const pokemonName = response.data.name.charAt(0).toUpperCase() + response.data.name.slice(1);
      const pokemonImage = response.data.sprites.other["official-artwork"].front_default;
      pokemonPack.push({ id: randomId, name: pokemonName, image: pokemonImage });
    } catch (error) {
      console.error(`Error al obtener el Pokémon con ID ${randomId}:`, error.message);
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0xffbf00)
    .setTitle("¡Paquete de Pokémon!")
    .setDescription(pokemonPack.map(p => `**#${p.id} ${p.name}**`).join("\n"))
    .setImage(pokemonPack[0]?.image || null);

  await User.findByIdAndUpdate(userId, { $inc: { coins: -coins } });
  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };