import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("use-stone")
  .setDescription("Usa una piedra para evolucionar un Pokémon.")
  .addStringOption((option) =>
    option
      .setName("stone")
      .setDescription("La piedra que deseas usar.")
      .setRequired(true)
      .addChoices(
        { name: "Fire Stone", value: "fire" },
        { name: "Water Stone", value: "water" },
        { name: "Thunder Stone", value: "thunder" },
        { name: "Leaf Stone", value: "leaf" },
        { name: "Moon Stone", value: "moon" }
      )
  )
  .addIntegerOption((option) =>
    option
      .setName("pokemon_number")
      .setDescription("El número del Pokémon que deseas evolucionar.")
      .setRequired(true)
  );

const stoneEvolutions = {
  fire: {
    37: { number: 38, name: 'Ninetales' }, // Vulpix -> Ninetales
    58: { number: 59, name: 'Arcanine' }, // Growlithe -> Arcanine
    133: { number: 136, name: 'Flareon' } // Eevee -> Flareon
  },
  water: {
    61: { number: 62, name: 'Poliwrath' }, // Poliwhirl -> Poliwrath
    90: { number: 91, name: 'Cloyster' }, // Shellder -> Cloyster
    120: { number: 121, name: 'Starmie' }, // Staryu -> Starmie
    133: { number: 134, name: 'Vaporeon' } // Eevee -> Vaporeon
  },
  thunder: {
    25: { number: 26, name: 'Raichu' }, // Pikachu -> Raichu
    133: { number: 135, name: 'Jolteon' } // Eevee -> Jolteon
  },
  leaf: {
    44: { number: 45, name: 'Vileplume' }, // Gloom -> Vileplume
    70: { number: 71, name: 'Victreebel' }, // Weepinbell -> Victreebel
    102: { number: 103, name: 'Exeggutor' } // Exeggcute -> Exeggutor
  },
  moon: {
    30: { number: 31, name: 'Nidoqueen' }, // Nidorina -> Nidoqueen
    33: { number: 34, name: 'Nidoking' }, // Nidorino -> Nidoking
    35: { number: 36, name: 'Clefable' }, // Clefairy -> Clefable
    39: { number: 40, name: 'Wigglytuff' } // Jigglypuff -> Wigglytuff
  }
};

async function execute(interaction) {
  const user = await User.findById(interaction.user.id);
  const stone = interaction.options.getString("stone");
  const pokemonNumber = interaction.options.getInteger("pokemon_number");

  if (!user.stones[stone] || user.stones[stone] <= 0) {
    await interaction.reply(`No tienes suficientes ${stone} stones.`);
    return;
  }

  const pokemon = user.pokemonCollection.find(p => p.number === pokemonNumber);
  if (!pokemon) {
    await interaction.reply("No tienes ese Pokémon en tu colección.");
    return;
  }

  const evolution = stoneEvolutions[stone][pokemonNumber];
  if (!evolution) {
    await interaction.reply("La piedra no tuvo efecto.");
    return;
  }

  user.stones[stone] -= 1;
  const existingPokemon = user.pokemonCollection.find(p => p.number === evolution.number);
  if (existingPokemon) {
    existingPokemon.count += 1;
  } else {
    user.pokemonCollection.push({ number: evolution.number, name: evolution.name, count: 1 });
  }

  await user.save();
  await interaction.reply(`Tu Pokémon ha evolucionado a ${evolution.name} usando una ${stone} stone.`);
}

export default { data, execute };