import User from "../models/user.model.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';
import sharp from 'sharp';
import bucket from '../config/firebase.js';
import { createReadStream } from 'streamifier';
import 'dotenv/config';





const data = new SlashCommandBuilder()
    .setName('getelos')
    .setDescription('Obtiene una lista de todos los Elo de mayor a menor');

async function execute(interaction) {
    // Busca todos los usuarios en la base de datos y los ordena por Elo de mayor a menor
    const users = await User.find().sort({ elo: -1 });
    await interaction.reply({ content: 'Calculando elo...', fetchReply: true });

    // Define el tamaño del canvas
    const canvasWidth = 700;
    const canvasHeight = users.length * 60; // 50 for the avatar height and 10 for the space between avatars

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext('2d');

    // Establece el estilo del texto
    context.font = '30px Arial';
    context.fillStyle = '#ffffff';

    // Para cada usuario, carga su avatar y dibuja su avatar y puntuación en el canvas
    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        // Get the Discord User object
        const discordUser = await interaction.client.users.fetch(user._id);

        // Get the avatar URL
        // Get the avatar URL
        const avatarURL = discordUser.displayAvatarURL({ format: 'png', dynamic: false });
        // Fetch the avatar from the URL


        // Create an image from the stream
        // Fetch the avatar from the URL
        const response = await fetch(avatarURL);
        const avatarBuffer = await response.arrayBuffer();
        const pngBuffer = await sharp(Buffer.from(avatarBuffer)).png().toBuffer();

        // Load the avatar into an image
        const img = await loadImage(pngBuffer);

        // Draw the avatar on the canvas
        context.drawImage(img, 10, i * 60, 50, 50);
        // Draw the avatar on the canvas

        // Draw the user's name and score on the canvas
        // Set the fill style to black
        context.fillStyle = '#2D3142';

        // Draw a rectangle where the text will be
        context.fillRect(70, i * 60, 600, 50);

        // Set the fill style to white for the text
        context.fillStyle = 'white';

        // Draw the text
        // Set the fill style based on the position
        if (i === 0) {
            // Gold for 1st place
            context.fillStyle = 'gold';
        } else if (i === 1) {
            // Silver for 2nd place
            context.fillStyle = 'silver';
        } else if (i === 2) {
            // Bronze for 3rd place
            context.fillStyle = 'darkorange';
        } else if (i === 3) {
            // Bronze for 3rd place
            context.fillStyle = 'green';
        } else {
            // White for other places
            context.fillStyle = 'white';
        }

        // Draw the position
        context.fillText(` #${i + 1}`, 70, i * 60 + 35);

        // Set the fill style to white for the rest of the text
        context.fillStyle = 'white';

        // Draw the rest of the text
        context.fillText(` / ${user.elo} / ${user.trainerName}`, 70 + context.measureText(` #${i + 1}`).width, i * 60 + 35);
    }

    // Convert the canvas to a buffer
    const buffer = canvas.toBuffer();

    // Create a file in Firebase Storage
    const file = bucket.file('leaderboard.png');

    // Create a read stream for the buffer
    const readStream = createReadStream(buffer);

    // Upload the image to Firebase Storage
    await new Promise((resolve, reject) => {
        readStream.pipe(file.createWriteStream())
            .on('error', reject)
            .on('finish', resolve);
    });

    // Make the file publicly accessible
    await file.makePublic();

    const timestamp = Date.now();
    const url = `https://storage.googleapis.com/${bucket.name}/${file.name}?t=${timestamp}`;

    const embed = new EmbedBuilder()
        .setColor(0xFFBF00)
        .setTitle('Tabla de clasificación / Pueblo Paleta 🎨')
        .setImage(url); // Use the URL of the uploaded image

    await interaction.editReply({ content: '¡Nueva tabla de clasificación!', embeds: [embed] });
}

export default { data, execute };