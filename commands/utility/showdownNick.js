import { SlashCommandBuilder } from 'discord.js';
import User from "../../model/user.model.js";

const data = new SlashCommandBuilder()
    .setName('updateshowdownnick')
    .setDescription('Update Showdown Nick for a user!')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to update')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('nick')
            .setDescription('The new Showdown Nick')
            .setRequired(true));

async function execute(interaction) {
    // Obtenemos el objeto User del parámetro 'user'
    const user = interaction.options.getUser('user');

    // Obtenemos el nuevo nick del parámetro 'nick'
    const newNick = interaction.options.getString('nick');

    // Actualizamos el nick del usuario
    try {
        const updatedUser = await User.findOneAndUpdate({ _id: user.id }, { $set: { showdownNick: newNick } }, { new: true });

        // Respondemos a la interacción
        await interaction.reply(`Showdown Nick updated successfully for ${user.username}! New Showdown Nick: ${updatedUser.showdownNick}`);
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error updating the Showdown Nick.');
    }
}

export default { data, execute };