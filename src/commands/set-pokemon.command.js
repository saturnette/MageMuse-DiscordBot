import { SlashCommandBuilder } from "discord.js";
import axios from "axios";
import User from "../models/user.model.js";

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
  const newPokemon = interaction.options.getString("pokemon");

  try {
    await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${newPokemon.toLowerCase()}`
    );
  } catch (error) {
    if (error.response && error.response.status === 404) {
      await interaction.reply(`El Pokémon ${newPokemon} no existe.`);
      return;
    } else {
      console.error(error);
      await interaction.reply("Hubo un error al verificar el Pokémon.");
      return;
    }
  }

  const user = await User.findById(interaction.user.id);

  if (user.registered) {
    await interaction.reply(
      "Ya estás registrado en la liga y no puedes agregar ningún Pokémon de tu equipo."
    );
    return;
  }

  if (user.team.length >= 12) {
    await interaction.reply(
      "No puedes agregar más Pokémon a tu equipo. El límite es 12."
    );
    return;
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: interaction.user.id },
      { $push: { team: newPokemon.toLowerCase() } },
      { new: true }
    );

    await interaction.reply(
      `¡Pokémon añadido exitosamente a tu equipo! Nuevo equipo: ${updatedUser.team.join(
        ", "
      )}`
    );
  } catch (error) {
    console.error(error);
    await interaction.reply("Hubo un error al agregar el Pokémon al equipo.");
  }
}

export default { data, execute };