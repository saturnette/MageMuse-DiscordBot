import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
    .setName('setregister')
    .setDescription('Register your showdown nick and Pokemon team!');

async function execute(interaction) {
    // Buscamos el usuario
    const user = await User.findById(interaction.user.id);

    // Verificamos si el usuario ya se ha registrado
    if (user.registered) {
        await interaction.reply('You have already registered!');
        return;
    }

    // Creamos el mensaje embed
    const embed = new EmbedBuilder()
        .setTitle('Showdown Registration')
        .addFields(
            { name: 'Nick', value: `${user.showdownNick || 'N/A'}`, inline: true },
            { name: 'Pokemon Team', value: user.team.join(', '), inline: true }
        )
        .setColor('#0099ff');

    // Enviamos el mensaje embed a un canal específico
    const channel = interaction.client.channels.cache.get('1238722863557509181'); // Reemplaza 'CHANNEL_ID' con el ID del canal
    await channel.send({ embeds: [embed] });

    // Marcamos al usuario como registrado
    user.registered = true;
    await user.save();

    // Respondemos a la interacción
    await interaction.reply('Your registration has been sent!');
}

export default { data, execute };