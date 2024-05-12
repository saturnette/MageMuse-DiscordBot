import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define el esquema para los perfiles de usuario
const userSchema = new mongoose.Schema({
    _id: String, // ID del usuario
    showdownNick: String, // Nick en showdown
    tryEF: { type: Number, default: 0},
    tryDay: { type: Number, default: 0},
    wins: Number,
    loses: Number,
    type: String,
    medalName: String,
    bannerURL: String,
    registered: { type: Boolean, default: false },
    medals: [String], // Lista de medallas
    team: [String], // Lista de medallas
    elo: { type: Schema.Types.Number, default: 1000 }, // Elo del usuario con valor por defecto de 1000
});

// Crea el modelo de Mongoose para los perfiles de usuario
export default mongoose.model('User', userSchema);