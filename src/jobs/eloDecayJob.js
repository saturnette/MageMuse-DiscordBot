import cron from 'node-cron';
import User from '../models/user.model.js';
// Programa la tarea para que se ejecute todos los días a las 9 AM GMT+0
cron.schedule('0 9 * * *', async () => {
    // Busca todos los usuarios en la base de datos
    const users = await User.find();

    // Itera sobre cada usuario
    for (let user of users) {
        // Si el usuario jugó más de 5 juegos, no hay decaimiento
        if (user.gamesPlayed > 5) {
            continue;
        }

        // Si el usuario jugó 1-5 juegos, pierde 1 punto por cada 100 puntos por encima de 1500 que es
        if (user.gamesPlayed >= 1 && user.elo > 1500) {
            user.elo -= Math.floor((user.elo - 1500) / 100);
        }

        // Si el usuario jugó 0 juegos, pierde 1 punto por cada 50 puntos por encima de 1400 que es
        if (user.gamesPlayed === 0 && user.elo > 1400) {
            user.elo -= Math.floor((user.elo - 1400) / 50);
        }

        // Restablece el campo gamesPlayed a cero
        user.gamesPlayed = 0;

        // Guarda el usuario con la calificación y gamesPlayed actualizados
        await user.save();
    }
}, {
    scheduled: true,
    timezone: "Etc/GMT"
});