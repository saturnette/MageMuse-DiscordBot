import User from "../../model/user.model.js";
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
    .setName('myinfomedal')
    .setDescription('Get information about yourself!');

async function execute(interaction) {
    // Obtenemos el objeto User del usuario que invocó el comando
    const user = interaction.user;

    // Obtenemos la información del usuario
    const userInfo = await getUserInfo(user.id);

    const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });

    const users = await User.find().sort({ elo: -1 });

    // Encuentra la posición del usuario en la lista ordenada
    const ranking = users.findIndex(user => user.id === userInfo.id) + 1;

    const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Medallero')
        .setURL('https://storage.googleapis.com/mawi-bot.appspot.com/pueblopaletaservericon.png')
        .setAuthor({ name: 'Pueblo Paleta', iconURL: 'https://firebasestorage.googleapis.com/v0/b/mawi-bot.appspot.com/o/pueblopaletaservericon.png?alt=media&token=1b0a6dc9-bb5e-4e66-8b0c-0d7b8c05a302', url: 'https://discord.js.org' })
        .setThumbnail(avatarURL)
        .addFields(
            { name: 'Entrenador', value: userInfo.trainerName || "N/A", inline: true },
            { name: 'Nick Showdown', value: userInfo.showdownNick || "N/A", inline: true },

            { name: '\u200B', value: '\u200B' },

            { name: 'Ladder', value: `${userInfo.elo.toString() || "N/A"} (Ranking #${ranking.toString() || "N/A"})`, inline: false },
            {
                name: 'Medallas',
                value: userInfo.medals && userInfo.medals.length > 0 ? userInfo.medals.join(', ') : "N/A",
                inline: false
            }
        )
        .setImage(avatarURL)
        .setTimestamp()

    await interaction.reply({ embeds: [exampleEmbed] });
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