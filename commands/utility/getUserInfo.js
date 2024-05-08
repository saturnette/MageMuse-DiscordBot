import User from "../../model/user.model.js";


import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('userinfomedal')
    .setDescription('Get information about a user!')
    .addUserOption(option => 
        option.setName('user')
            .setDescription('The user to get information about')
            .setRequired(true));

async function execute(interaction) {
    // Obtenemos el objeto User del parámetro 'user'
    const user = interaction.options.getUser('user');

    // Obtenemos la información del usuario
    const userInfo = await getUserInfo(user.id);

    // Respondemos a la interacción con la información del usuario
    await interaction.reply(userInfo || 'User not found.');
}


async function getUserInfo(userId) {
    // Busca el perfil del usuario
    const user = await User.findById(userId);

    // Si el usuario no existe, devuelve null
    if (!user) return null;

    // Devuelve la información del usuario
return `Entrenador: ${user.trainerName}\nMedals: ${user.medals.join(', ')}`;}

export default {
    data,
    execute
}