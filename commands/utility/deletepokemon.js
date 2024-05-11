import { SlashCommandBuilder } from 'discord.js';
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
    .setName('removepokemon')
    .setDescription('Remove a Pokemon from your team!')
    .addStringOption(option =>
        option.setName('pokemon')
            .setDescription('The Pokemon to remove')
            .setRequired(true));

async function execute(interaction) {
    // Obtenemos el Pokémon a eliminar del parámetro 'pokemon'
    const pokemonToRemove = interaction.options.getString('pokemon').toLowerCase();

    // Buscamos el usuario
    const user = await User.findById(interaction.user.id);

    // Verificamos si el usuario está registrado
    if (user.registered) {
        await interaction.reply('You are registered and cannot remove Pokemon from your team.');
        return;
    }

    // Verificamos si el usuario tiene el Pokémon en su equipo
    if (!user.team.includes(pokemonToRemove)) {
        await interaction.reply(`You do not have the Pokemon ${pokemonToRemove} in your team.`);
        return;
    }

    // Actualizamos el equipo del usuario
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: interaction.user.id }, { $pull: { team: pokemonToRemove } }, { new: true });

        // Respondemos a la interacción
        await interaction.reply(`Pokemon removed successfully from your team! New team: ${updatedUser.team.join(', ')}`);
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error removing the Pokemon from the team.');
    }
}

export default { data, execute };