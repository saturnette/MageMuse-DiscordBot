import User from "../models/user.model.js";

import { SlashCommandBuilder} from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('calculateelo')
    .setDescription('Calculate Elo for two users!')
    .addUserOption(option =>
        option.setName('winner')
            .setDescription('The winner user')
            .setRequired(true))
    .addUserOption(option =>
        option.setName('loser')
            .setDescription('The loser user')
            .setRequired(true));

async function execute(interaction) {
    // Obtenemos el objeto User del parámetro 'winner'
    const winner = interaction.options.getUser('winner');

    // Obtenemos el objeto User del parámetro 'loser'
    const loser = interaction.options.getUser('loser');

    if (winner.id === loser.id) {
        await interaction.reply('The winner and the loser cannot be the same user.');
        return;
    }
    // Actualizamos el Elo de los usuarios
    try {
        const winnerUser = await User.findOneAndUpdate({ _id: winner.id }, { $setOnInsert: { elo: 1000, trainerName: winner.username } }, { upsert: true, new: true });
        const loserUser = await User.findOneAndUpdate({ _id: loser.id }, { $setOnInsert: { elo: 1000,  trainerName: loser.username } }, { upsert: true, new: true });

        const elow = winnerUser.elo;
        const elol = loserUser.elo;
        console.log(elow)
        // Actualiza el Elo de los usuarios
        await updateElo(winnerUser._id, loserUser._id);

        const winnerUse = await User.findById(winnerUser._id);
        const loserUse = await User.findById(loserUser._id);
        
        // Respondemos a la interacción
        await interaction.reply(`Elo updated successfully for ${winner.username} and ${loser.username}!
        Elo change for ${winner.username}: + ${winnerUse.elo - elow}
        Elo change for ${loser.username}: - ${elol - loserUse.elo}`);
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error updating the Elo.');
    }
}

async function updateElo(winnerId, loserId) {
    // Busca al ganador y al perdedor en la base de datos
    const winner = await User.findById(winnerId);
    const loser = await User.findById(loserId);

    // Calcula el factor K para cada jugador
    const kWinner = getKFactor(winner.elo);
    const kLoser = getKFactor(loser.elo);

    // Calcula el Elo esperado para cada jugador
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
    const expectedLoser = 1 - expectedWinner;

    // Actualiza el Elo de cada jugador
    winner.elo = parseInt(Math.round(winner.elo + kWinner * (1 - expectedWinner)), 10);
    loser.elo = parseInt(Math.round(loser.elo + kLoser * (0 - expectedLoser)), 10);
      
    // Establece un piso de calificación de 1000
    if (winner.elo < 1000) winner.elo = 1000;
    if (loser.elo < 1000) loser.elo = 1000;

    // Guarda los nuevos valores de Elo en la base de datos
    await winner.save();
    await loser.save();

    console.log(`Nuevo Elo del ganador: ${Math.round(winner.elo)}`);
    console.log(`Nuevo Elo del perdedor: ${Math.round(loser.elo)}`);
}

function getKFactor(elo) {
    if (elo < 1100) {
        return 80 - (30 * (elo - 1000) / 100);
    } else if (elo < 1300) {
        return 50;
    } else if (elo < 1600) {
        return 40;
    } else {
        return 32;
    }
}

export default { data, execute };