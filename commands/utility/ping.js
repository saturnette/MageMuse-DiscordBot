import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user!')
    .addUserOption(option => 
        option.setName('user')
            .setDescription('The user to get information about')
            .setRequired(true));

async function execute(interaction) {
    // Obtenemos el objeto User del parámetro 'user'
    const user = interaction.options.getUser('user');

    // Creamos un mensaje con la información del usuario
    const userInfo = `User name: ${user.username}\nUser ID: ${user.id}\nAvatar URL: ${user.displayAvatarURL()}`;

    // Respondemos a la interacción con la información del usuario
    await interaction.reply(userInfo);
}

export default { data, execute };