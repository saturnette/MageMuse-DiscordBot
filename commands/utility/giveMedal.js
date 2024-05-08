import User from "../../model/user.model.js";
import { SlashCommandBuilder } from 'discord.js';


const data = new SlashCommandBuilder()
    .setName('givemedal')
    .setDescription('Get information about a user!')
    .addUserOption(option => 
        option.setName('user')
            .setDescription('The user to get information about')
            .setRequired(true)
        
        )
        .addStringOption(option => 
            option.setName('medal')
                .setDescription('The user to get information about')
                .setRequired(true)
            
            );

async function execute(interaction) {
    // Obtenemos el objeto User del parámetro 'user'
    const user = interaction.options.getUser('user');

    // Obtenemos el nombre de la medalla del parámetro 'medal'
    const medalName = interaction.options.getString('medal');

    // Damos la medalla al usuario
    await giveMedal(user.id, user.username, medalName);

    // Respondemos a la interacción
    await interaction.reply(`¡${user.username} ha obtenido la medalla ${medalName}!`);
}

async function giveMedal(userId, trainerName, medalName) {
    // Busca el perfil del usuario o crea uno nuevo si no existe
    const user = await User.findById(userId) || new User({ _id: userId, trainerName: trainerName });

    // Agrega la medalla al perfil del usuario
    user.medals.push(medalName);

    // Guarda el perfil del usuario
    await user.save();
}

export default { data, execute };