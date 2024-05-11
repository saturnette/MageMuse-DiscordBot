import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import User from "../../model/user.model.js";

const data = new SlashCommandBuilder()
    .setName('addpokemon')
    .setDescription('Add a Pokemon to your team!')
    .addStringOption(option =>
        option.setName('pokemon')
            .setDescription('The Pokemon to add')
            .setRequired(true));

async function execute(interaction) {
    // Obtenemos el nuevo Pokémon del parámetro 'pokemon'
    const newPokemon = interaction.options.getString('pokemon');

    // Verificamos si el Pokémon existe en la PokeAPI
    try {
        await axios.get(`https://pokeapi.co/api/v2/pokemon/${newPokemon.toLowerCase()}`);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            await interaction.reply(`The Pokemon ${newPokemon} does not exist.`);
            return;
        } else {
            console.error(error);
            await interaction.reply('There was an error verifying the Pokemon.');
            return;
        }
    }

        // Buscamos el usuario
        const user = await User.findById(interaction.user.id);

        // Verificamos si el usuario ya tiene 12 Pokémon en su equipo
        if (user.team.length >= 12) {
            await interaction.reply('You cannot add more Pokemon to your team. The limit is 12.');
            return;
        }

    // Actualizamos el equipo del usuario
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: interaction.user.id }, { $push: { team: newPokemon.toLowerCase() } }, { new: true });

        // Respondemos a la interacción
        await interaction.reply(`Pokemon added successfully to your team! New team: ${updatedUser.team.join(', ')}`);
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error adding the Pokemon to the team.');
    }
}

export default { data, execute };