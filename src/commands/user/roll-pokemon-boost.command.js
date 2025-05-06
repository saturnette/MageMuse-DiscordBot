import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import User from "../../models/user.model.js";
import { rollChannelOnly } from "../../middlewares/channel.middleware.js";

const data = new SlashCommandBuilder()
  .setName("roll-pokemon-boost")
  .setDescription("Obtén un paquete de 5 Pokémon con probabilidades iguales.")
  .addIntegerOption((option) =>
    option
      .setName("coins")
      .setDescription("Cantidad de coins a invertir (mínimo 250).")
      .setRequired(true)
  );

async function execute(interaction) {
  const userId = interaction.user.id;
  const coins = interaction.options.getInteger("coins");

  if (coins < 250) {
    await interaction.reply("Debes invertir al menos 250 coins para usar este comando.");
    return;
  }

  const user = await User.findById(userId);

  if (!user || user.coins < coins) {
    await interaction.reply("No tienes suficientes coins para usar este comando.");
    return;
  }

  const pokemonPack = [];

  // Selección completamente aleatoria del 1 al 151
  for (let i = 0; i < 5; i++) {
    const randomId = Math.floor(Math.random() * 151) + 1; // Generar un ID aleatorio entre 1 y 151
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const pokemonName = response.data.name.charAt(0).toUpperCase() + response.data.name.slice(1);
      const pokemonImage = response.data.sprites.other["official-artwork"].front_default;

      pokemonPack.push({ number: randomId, name: pokemonName, image: pokemonImage });
    } catch (error) {
      console.error(`Error al obtener el Pokémon con ID ${randomId}:`, error.message);
    }
  }

  // Actualizar la colección del usuario con los nuevos Pokémon
  const newPokemonPack = [];
  for (const pokemon of pokemonPack) {
    const existingPokemon = user.pokemonCollection.find((p) => p.number === pokemon.number);
    if (existingPokemon) {
      existingPokemon.count += 1; // Incrementar el count si ya existe
      newPokemonPack.push({ ...pokemon, count: existingPokemon.count });
    } else {
      user.pokemonCollection.push({ number: pokemon.number, name: pokemon.name, count: 1 }); // Agregar nuevo Pokémon
      newPokemonPack.push({ ...pokemon, count: 1, isNew: true });
    }
  }

  await user.save();

  const embed = new EmbedBuilder()
    .setColor(0xffbf00)
    .setTitle("¡Paquete de Pokémon!")
    .setDescription(
      newPokemonPack
        .map((p) =>
          p.isNew
            ? `**#${p.number} ${p.name}** (Nuevo 🎀)`
            : `**#${p.number} ${p.name}** (x${p.count})`
        )
        .join("\n")
    )
    .setImage(newPokemonPack[0]?.image || null);

  await User.findByIdAndUpdate(userId, { $inc: { coins: -coins } });
  await interaction.reply({ embeds: [embed] });
}

export default { data, execute: rollChannelOnly(execute) };