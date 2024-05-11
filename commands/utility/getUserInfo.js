import User from "../../model/user.model.js";

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { loadImage, createCanvas } from 'canvas';
import axios from "axios";
import { createReadStream } from 'streamifier';
import 'dotenv/config';
import bucket from '../../firebase.js';
// Define las constantes para las imágenes y las medallas en la parte superior del archivo
const backgroundImageUrl = 'https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/bg.png?alt=media&token=f585c2a8-4926-43bf-945e-51fd436b6b7f';
const medallaSiluetaUrl = 'https://images.wikidexcdn.net/mwuploads/wikidex/0/09/latest/20180812034547/Medalla_Arco%C3%ADris.png';
const medallaColorUrl = 'https://images.wikidexcdn.net/mwuploads/wikidex/e/e6/latest/20180812014833/Medalla_Trueno.png';
const medallas = [
    { x: 25, y: 5, width: 50, height: 50 },
    { x: 100, y: 5, width: 50, height: 50 },
    { x: 175, y: 5, width: 50, height: 50 },
    { x: 250, y: 5, width: 50, height: 50 },
    { x: 325, y: 5, width: 50, height: 50 },
    { x: 25, y: 75, width: 50, height: 50 },
    { x: 100, y: 75, width: 50, height: 50 },
    { x: 175, y: 75, width: 50, height: 50 },
    { x: 250, y: 75, width: 50, height: 50 },
    { x: 325, y: 75, width: 50, height: 50 }

];

async function getPokemonSprite(pokemonName) {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    return response.data.sprites.front_default;
}


const data = new SlashCommandBuilder()
    .setName('userinfomedal')
    .setDescription('Get information about a user!')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to get information about')
            .setRequired(false));

async function execute(interaction) {
    // Obtenemos el objeto User del parámetro 'user'
    const user = interaction.options.getUser('user') || interaction.user; // Cambia esta línea para usar interaction.user si no se proporcionó un usuario
    await interaction.reply({ content: 'Obteniendo datos...', fetchReply: true });

    console.log(user);
    // Obtenemos la información del usuario
    const userInfo = await getUserInfo(user.id);

    console.log(userInfo);
    // Respondemos a la interacción con la información del usuario
    // await interaction.reply(userInfo || 'User not found.');
    const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });

    const users = await User.find().sort({ elo: -1 });

    // Encuentra la posición del usuario en la lista ordenada
    const ranking = users.findIndex(user => user.id === userInfo.id) + 1;

    const canvas = createCanvas(800, 500);
    const context = canvas.getContext('2d');

    // Carga las imágenes
    const backgroundImage = await loadImage(backgroundImageUrl);
    const medallaSilueta = await loadImage(medallaSiluetaUrl);
    const medallaColor = await loadImage(medallaColorUrl);

    // Dibuja la imagen de fondo en el canvas
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Dibuja las medallas en el canvas
    userInfo.medals.forEach((medalla, index) => {
        const image = medalla ? medallaColor : medallaSilueta;
        context.drawImage(image, medallas[index].x * 2, medallas[index].y * 2, medallas[index].width * 2, medallas[index].height * 2);
    });

    const pokeballIconUrl = 'https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/pokeballbg.png?alt=media&token=195fe6f1-8805-4261-9d3d-f54a5b226f5e';
    const pokeballIcon = await loadImage(pokeballIconUrl);
    const row1 = userInfo.team.slice(0, 6);
    const row2 = userInfo.team.slice(6, 12);
    
    for (let i = 0; i < row1.length; i++) {
        const pokemonName = row1[i];
        if (pokemonName) {
            const spriteUrl = await getPokemonSprite(pokemonName);
            const spriteImage = await loadImage(spriteUrl);
    
            // Dibuja el icono de la pokeball y el sprite del Pokémon en la primera fila
            context.drawImage(pokeballIcon, 100 * i, 310, 100, 100);
            context.drawImage(spriteImage, 100 * i, 310, 100, 100);
        }
    }
    
    for (let i = 0; i < row2.length; i++) {
        const pokemonName = row2[i];
        if (pokemonName) {
            const spriteUrl = await getPokemonSprite(pokemonName);
            const spriteImage = await loadImage(spriteUrl);
    
            // Dibuja el icono de la pokeball y el sprite del Pokémon en la segunda fila
            // Alinea la segunda fila a la derecha restando la posición de i del ancho total del canvas
            context.drawImage(pokeballIcon, 100 * (i + 2), 400, 100, 100);
            context.drawImage(spriteImage, 100 * (i + 2), 400, 100, 100);
        }
    }
    // Convierte el canvas a un buffer
    const buffer = canvas.toBuffer('image/png');

    // Sube el buffer a Firebase Storage
    const file = bucket.file(`${user.id}.png`);
    const stream = file.createWriteStream({
        metadata: {
            contentType: 'image/png'
        }
    });
    createReadStream(buffer).pipe(stream);

    // Espera a que la imagen se suba
    await new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', resolve);
    });

    let url = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
    });

    // Añade el parámetro de consulta a la URL
    url = url[0] + `&time=${Date.now()}`;

    const exampleEmbed = new EmbedBuilder()
        .setColor(0xFFBf00)
        .setTitle(`${user.globalName} (${user.username})`)
        .setAuthor({ name: 'Pueblo Paleta', iconURL: 'https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/pueblopaletaservericon.png?alt=media&token=1b0a6dc9-bb5e-4e66-8b0c-0d7b8c05a302', url: 'https://discord.js.org' })
        .setThumbnail(avatarURL)
        .addFields(
            {
                name: ' ',
                value: `**🎯 Showdown:** ${userInfo.showdownNick || "N/A"}\n**⭐ Elo:** ${userInfo.elo.toString() || "N/A"}\n**👑 Rank* #${ranking.toString() || "N/A"}`,
                inline: true
            },
            { name: '\u200B', value: '\u200B' },

            {
                name: '🏅 Medallas Obtenidas:',
                value: userInfo.medals && userInfo.medals.length > 0 ? userInfo.medals.join(', ') : "N/A",
                inline: false
            }
        )
        .setImage(url)
        .setTimestamp()
    await interaction.editReply({ content: '¡Datos obtenidos!', embeds: [exampleEmbed] });

}


async function getUserInfo(userId) {
    // Busca el perfil del usuario
    const user = await User.findById(userId);

    // Si el usuario no existe, devuelve null
    if (!user) return null;

    // Devuelve la información del usuario
    return user;
}

export default {
    data,
    execute
}