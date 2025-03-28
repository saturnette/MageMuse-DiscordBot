import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("poke-friend")
  .setDescription("Establece tu Pokémon compañero.")
  .addIntegerOption(option =>
    option.setName('pokemon_number')
      .setDescription('El número del Pokémon que deseas establecer como compañero.')
      .setRequired(true));

async function execute(interaction) {
  const user = await User.findById(interaction.user.id);
  const pokemonNumber = interaction.options.getInteger('pokemon_number');

  if (!user || !user.catcher) {
    await interaction.reply("No estás registrado en el Palette Dex.");
    return;
  }

  const pokemon = user.pokemonCollection.find(p => p.number === pokemonNumber);

  if (!pokemon) {
    await interaction.reply("No posees este Pokémon.");
    return;
  }

  let spriteUrl;
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`);
    spriteUrl = response.data.sprites.front_default;
  } catch (error) {
    console.error(error);
    await interaction.reply("Hubo un error al obtener el sprite del Pokémon.");
    return;
  }

  user.companionPokemon = { number: pokemon.number, name: pokemon.name, count: pokemon.count };
  user.companionBattles = 0;

  await user.save();

  const embed = new EmbedBuilder()
    .setColor(0xffbf00)
    .setTitle(`¡Has establecido a ${pokemon.name} como tu Pokémon compañero!`)
    .setDescription(`Número: ${pokemon.number}\nNombre: ${pokemon.name}`)
    .setImage(spriteUrl);

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute };