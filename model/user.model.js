import mongoose from 'mongoose';

// Define el esquema para los perfiles de usuario
const userSchema = new mongoose.Schema({
    _id: String, // ID del usuario
    trainerName: String, // Nombre del usuario
    showdownNick: String, // Nick en showdown
    medals: [String], // Lista de medallas
});

// Crea el modelo de Mongoose para los perfiles de usuario
export default mongoose.model('User', userSchema);