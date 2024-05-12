import User from "../models/user.model.js";
import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('win')
    .setDescription('Register a win for the leader and a loss for a user!')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user who lost')
            .setRequired(true)
    );

    async function execute(interaction) {
        // Obtenemos el objeto User del parámetro 'user'
        const losingUser = interaction.options.getUser('user');
    
        try {
            // Buscamos el perfil del líder (el que invocó el comando) en la base de datos
            const leaderProfile = await User.findById(interaction.user.id);
    
            // Si el líder no tiene un perfil, lanzamos un error
            if (!leaderProfile) {
                throw new Error('Leader does not have a profile');
            }
    
            // Buscamos el perfil del usuario que perdió
            const user = await User.findById(losingUser.id);
            if (!user) {
                throw new Error('User does not have a profile');
            }
    
            // Verificamos que el número de intentos del usuario que perdió sea menor a 2
            if (user.tryDay >= 2) {
                throw new Error('User has already tried twice');
            }
    
            // Incrementamos el conteo de intentos del usuario que perdió
            user.tryDay += 1;
            await user.save();
    
            // Incrementamos el conteo de victorias del líder
            leaderProfile.wins += 1;
            await leaderProfile.save();
    
            // Respondemos a la interacción
            await interaction.reply(`¡${interaction.user.username} ha ganado! ${losingUser.username} ha perdido.`);
        } catch (error) {
            // Respondemos a la interacción con el mensaje de error
            await interaction.reply(error.message);
        }
    }

export default { data, execute };