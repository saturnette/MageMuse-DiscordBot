import User from "../../model/user.model.js";

import { SlashCommandBuilder } from "discord.js";

    const data =new SlashCommandBuilder()
        .setName('getelos')
        .setDescription('Obtiene una lista de todos los Elo de mayor a menor');
    
        async function execute(interaction) {
        // Busca todos los usuarios en la base de datos y los ordena por Elo de mayor a menor
        const users = await User.find().sort({ elo: -1 });

        // Crea una lista de los Elo de los usuarios
        const eloList = users.map(user => `${user.trainerName}: ${user.elo}`).join('\n');

        // Devuelve la lista de Elo
        await interaction.reply(eloList);
    }

export default { data, execute };