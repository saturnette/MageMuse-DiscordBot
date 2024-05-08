import mongoose from 'mongoose';

// Define el esquema para los perfiles de usuario
const userSchema = new mongoose.Schema({
    _id: String, // ID del usuario
    trainerName: String, // Nombre del usuario
    medals: [String], // Lista de medallas
});

// Crea el modelo de Mongoose para los perfiles de usuario
export default mongoose.model('User', userSchema);