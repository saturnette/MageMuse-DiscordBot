import { SlashCommandBuilder } from 'discord.js';
import User from '../models/user.model.js'; // Asegúrate de que la ruta sea correcta

const data = new SlashCommandBuilder()
    .setName('assignmedal')
    .setDescription('Asigna un tipo y un nombre de medalla a un usuario')
    .addUserOption(option => 
        option.setName('user')
            .setDescription('El usuario al que asignar la medalla')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('type')
            .setDescription('El tipo de medalla a asignar')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('medalname')
            .setDescription('El nombre de la medalla a asignar')
            .setRequired(true));

async function execute(interaction) {
    const user = interaction.options.getUser('user');
    const type = interaction.options.getString('type');
    const medalName = interaction.options.getString('medalname');

    // Actualiza el usuario en la base de datos
    await User.findByIdAndUpdate(user.id, { type, medalName });

    // Responde al comando
    await interaction.reply(`¡${user.username} asciende a líder tipo ${type}, su medalla es ${medalName}! `);
}

export default { data, execute };