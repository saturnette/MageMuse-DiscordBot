import User from "../models/user.model.js";
import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('givemedal')
    .setDescription('Get information about a user!')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to get information about')
            .setRequired(true)
    );

async function execute(interaction) {
    // Obtenemos el objeto User del parámetro 'user'
    const recipientUser = interaction.options.getUser('user');

    try {
        // Buscamos el perfil del líder (el que invocó el comando) en la base de datos
        const leaderProfile = await User.findById(interaction.user.id);

        // Si el líder no tiene un perfil o no tiene un medalName, lanzamos un error
        if (!leaderProfile || !leaderProfile.medalName) {
            throw new Error('No tienes permisos para ejecutar este comando.');
        }

        // Buscamos el perfil del usuario que recibirá la medalla
        const user = await User.findById(recipientUser.id);
        if (!user) {
            throw new Error('User does not have a profile');
        }

        // Verificamos que el número de intentos del usuario sea menor a 2
        if (user.tryDay >= 2) {
            throw new Error('User has already tried twice');
        }
        // Damos la medalla del líder al usuario
        const medalGiven = await giveMedal(recipientUser.id, leaderProfile.medalName);

        leaderProfile.loses += 1;
        await leaderProfile.save();
        // Respondemos a la interacción
        if (medalGiven) {
            await interaction.reply(`¡${recipientUser.username} ha obtenido la medalla ${leaderProfile.medalName} de ${interaction.user.username}!`);
        } else {
            await interaction.reply(`¡${recipientUser.username} ya tiene la medalla ${leaderProfile.medalName}!`);
        }
    } catch (error) {
        // Respondemos a la interacción con el mensaje de error
        await interaction.reply(error.message);
    }
}

async function giveMedal(userId, medalName) {
    // Busca el perfil del usuario o crea uno nuevo si no existe
    const user = await User.findById(userId) || new User({ _id: userId });

    if (!user.medals.includes(medalName)) {
        // Agrega la medalla al perfil del usuario
        user.medals.push(medalName);

        // Incrementa el conteo de intentos del usuario
        user.tryDay += 1;

        // Guarda el perfil del usuario
        await user.save();

        // Devuelve true para indicar que la medalla fue agregada
        return true;
    }

    // Devuelve false para indicar que el usuario ya tenía la medalla
    return false;
}

export default { data, execute };