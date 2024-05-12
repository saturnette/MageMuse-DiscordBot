import { SlashCommandBuilder } from 'discord.js';
import User from "../models/user.model.js";

const data = new SlashCommandBuilder()
    .setName('reduce-tryef')
    .setDescription('Reduce el campo tryEF del usuario en uno.')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('El usuario al que le gustaría reducir su tryEF')
            .setRequired(true)
    );

async function execute(interaction) {
    // Obtenemos el objeto User del parámetro 'user'
    const recipientUser = interaction.options.getUser('user');

    // Buscamos el perfil del usuario en la base de datos
    const userProfile = await User.findById(recipientUser.id);

    if (userProfile.tryEF === 0) {
        await interaction.reply(`El campo tryEF de ${recipientUser.username} ya está en 0 y no puede reducirse más.`);
        return;
    }

    // Reducimos el campo tryEF en uno
    userProfile.tryEF -= 1;

    // Guardamos el perfil del usuario
    await userProfile.save();

    await interaction.reply(`Se ha reducido el campo tryEF de ${recipientUser.username} en uno.`);
}

export default { data, execute };