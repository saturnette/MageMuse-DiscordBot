import User from "../../model/user.model.js";

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

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

    console.log(user);
    // Obtenemos la información del usuario
    const userInfo = await getUserInfo(user.id);

    console.log(userInfo);
    // Respondemos a la interacción con la información del usuario
    // await interaction.reply(userInfo || 'User not found.');
    const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });

    const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Medallero')
        .setURL('https://discord.js.org/')
        .setAuthor({ name: 'Pueblo Paleta', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
        .setThumbnail(avatarURL)
        .addFields(
            { name: 'Entrenador', value: userInfo.trainerName || "n/a", inline: true },
            { name: '\u200B', value: '\u200B' },
            { 
                name: 'Medallas', 
                value: userInfo.medals && userInfo.medals.length > 0 ? userInfo.medals.join(', ') : "n/a", 
                inline: true 
            }        
        )
        .setImage(avatarURL)
        .setTimestamp()

    await interaction.reply({ embeds: [exampleEmbed] });
}


async function getUserInfo(userId) {
    // Busca el perfil del usuario
    const user = await User.findById(userId);

    // Si el usuario no existe, devuelve null
    if (!user) return null;

    // Devuelve la información del usuario
    return user;
}

export default {
    data,
    execute
}