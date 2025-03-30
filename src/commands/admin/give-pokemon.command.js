import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import User from "../../models/user.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";
import axios from "axios";

const data = new SlashCommandBuilder()
  .setName("give-pokemon")
  .setDescription("Da un Pokémon a un usuario")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario al que deseas dar un Pokémon")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("pokemon_number")
      .setDescription("El número del Pokémon a dar")
      .setRequired(true)
  );

async function execute(interaction) {
  const userToGive = interaction.options.getUser("user");
  const pokemonNumber = interaction.options.getInteger("pokemon_number");

  const user = await User.findOne({ _id: userToGive.id });

  if (!user) {
    await interaction.reply("El usuario especificado no existe.");
    return;
  }

  const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`);
  const pokemonName = response.data.name.charAt(0).toUpperCase() + response.data.name.slice(1);

  const existingPokemon = user.pokemonCollection.find(p => p.number === pokemonNumber);
  if (existingPokemon) {
    existingPokemon.count += 1;
  } else {
    user.pokemonCollection.push({ number: pokemonNumber, name: pokemonName, count: 1 });
  }

  await user.save();

  await interaction.reply(
    `El usuario ${user.username} ha recibido un ${pokemonName} exitosamente.`
  );
}

export default { data, execute: adminOnly(execute) };