import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import Channel from "../../models/channel.model.js";

const data = new SlashCommandBuilder()
  .setName("set-channel")
  .setDescription("Configura el ID de un canal")
  .addStringOption((option) =>
    option
      .setName("channeltype")
      .setDescription("El tipo de canal a configurar")
      .setRequired(true)
      .addChoices(
        { name: 'log', value: 'log' },
        { name: 'register', value: 'register' },
        { name: 'lobby', value: 'lobby' },
        { name: 'ladder', value: 'ladder' }
      )
  )
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("El canal a configurar")
      .setRequired(true)
  );

async function execute(interaction) {

  // Verificar si el usuario que ejecuta el comando tiene permisos de administrador
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply('Solo los administradores pueden usar este comando.');
    return;
  }

  const channelType = interaction.options.getString("channeltype");
  const channel = interaction.options.getChannel("channel");

  const update = {};
  update[channelType] = channel.id;

  await Channel.findOneAndUpdate({}, update, { upsert: true });

  await interaction.reply(
    `El canal ${channel.name} ha sido configurado como el canal ${channelType}.`
  );
}

export default { data, execute };