import { SlashCommandBuilder } from "discord.js";
import axios from "axios";
import User from "../../models/user.model.js";
import { lobbyChannelOnly } from "../../middlewares/channel.middleware.js";

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
      const suggestions = allPokemon.filter((name) =>
        name.startsWith(newPokemon.slice(0, 2)) // Buscar nombres que comiencen con las mismas letras
      );

      const suggestionMessage = suggestions.length
        ? `¿Quizás quisiste decir: ${suggestions.slice(0, 5).join(", ")}?`
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
      "Ya estás registrado en la liga y no puedes agregar ningún Pokémon a tu equipo... Debiste leer mi mensaje... :nazunastare: "
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
      `¡Pokémon añadido exitosamente a tu equipo! Ahora tienes **${updatedUser.team.length}** pokémon en tu equipo.\n\nPuedes eliminar un Pokémon con el comando **/remove-pokemon**, además, si ya tienes los 12 pokémon puedes registrarte con **/register-team**\n\nEquipo:\n ${updatedUser.team.join(", ")}`
    );
  } catch (error) {
    console.error(error);
    await interaction.reply("Hubo un error al agregar el Pokémon al equipo.");
  }
}

export default { data, execute: lobbyChannelOnly(execute) };