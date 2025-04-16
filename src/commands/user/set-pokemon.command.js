import { SlashCommandBuilder } from "discord.js";
import axios from "axios";
import User from "../../models/user.model.js";
import { lobbyChannelOnly } from "../../middlewares/channel.middleware.js";

// Función para calcular la distancia de Levenshtein
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Eliminación
        matrix[i][j - 1] + 1, // Inserción
        matrix[i - 1][j - 1] + cost // Sustitución
      );
    }
  }

  return matrix[a.length][b.length];
}

// Función para encontrar las mejores sugerencias
function getSuggestions(input, allPokemon, limit = 5) {
  const scored = allPokemon.map((name) => ({
    name,
    score: levenshteinDistance(input, name),
  }));

  scored.sort((a, b) => a.score - b.score); // Ordenar por menor distancia
  return scored.slice(0, limit).map((entry) => entry.name);
}

const data = new SlashCommandBuilder()
  .setName("set-pokemon")
  .setDescription("¡Añade un Pokémon a tu equipo!")
  .addStringOption((option) =>
    option
      .setName("pokemon")
      .setDescription("Este Pokémon será añadido a tu equipo.")
      .setRequired(true)
  );

async function execute(interaction) {
  const newPokemon = interaction.options.getString("pokemon").toLowerCase();

  // Verificar si el Pokémon existe
  let pokemonExists = true;
  try {
    await axios.get(`https://pokeapi.co/api/v2/pokemon/${newPokemon}`);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      pokemonExists = false;
    } else {
      console.error(error);
      await interaction.reply("Hubo un error al verificar el Pokémon.");
      return;
    }
  }

  // Si el Pokémon no existe, sugerir nombres similares
  if (!pokemonExists) {
    try {
      const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1000");
      const allPokemon = response.data.results.map((p) => p.name);

      // Obtener sugerencias basadas en similitud
      const suggestions = getSuggestions(newPokemon, allPokemon);

      const suggestionMessage = suggestions.length
        ? `¿Quizás quisiste decir: ${suggestions.join(", ")}? :thinking:`
        : "No se encontraron sugerencias.";

      await interaction.reply(`El Pokémon ${newPokemon} no existe. ${suggestionMessage}`);
      return;
    } catch (error) {
      console.error(error);
      await interaction.reply("Hubo un error al buscar sugerencias para el Pokémon.");
      return;
    }
  }

  // Verificar si el usuario ya tiene el Pokémon en su equipo
  const user = await User.findById(interaction.user.id);

  if (user.registered) {
    await interaction.reply(
      "Ya estás registrado en la liga y no puedes agregar ningún Pokémon a tu equipo... Debiste leer mi mensaje... 😖"
    );
    return;
  }

  if (user.team.includes(newPokemon)) {
    await interaction.reply(
      `El Pokémon **${newPokemon}** ya está en tu equipo. No puedes agregar duplicados.`
    );
    return;
  }

  if (user.team.length >= 12) {
    await interaction.reply(
      "No puedes agregar más Pokémon a tu equipo. El límite es 12."
    );
    return;
  }

  // Agregar el Pokémon al equipo
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: interaction.user.id },
      { $push: { team: newPokemon } },
      { new: true }
    );

    await interaction.reply(
      `¡Pokémon añadido exitosamente a tu equipo! Ahora tienes **${updatedUser.team.length}** pokémon en tu equipo.\n\n- Puedes eliminar un Pokémon con el comando **/remove-pokemon**\n- Si ya tienes los 12 pokémon puedes registrarte con **/register-team**\n\nEquipo:\n${updatedUser.team.join(", ")}`
    );
  } catch (error) {
    console.error(error);
    await interaction.reply("Hubo un error al agregar el Pokémon al equipo.");
  }
}

export default { data, execute: lobbyChannelOnly(execute) };