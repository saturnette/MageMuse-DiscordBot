import  Cron from 'node-cron';
import User from '../model/user.model.js';

Cron.schedule('0 0 * * *', async function() {
    try {
        // Restablece el campo 'tryDay' a 0 para todos los usuarios
        await User.updateMany({}, { tryDay: 0 });
        console.log('Reset tryDay for all users');
    } catch (error) {
        console.error('Error resetting tryDay for all users:', error);
    }
}, null, true, 'America/Tegucigalpa'); // Configura la zona horaria a Tegucigalpa