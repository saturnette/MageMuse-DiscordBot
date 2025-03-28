import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import Channel from "../../models/channel.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";

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
        { name: 'ladder', value: 'ladder' },
        { name: 'roll', value: 'roll' }
      )
  )
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("El canal a configurar")
      .setRequired(true)
  );

async function execute(interaction) {

  const channelType = interaction.options.getString("channeltype");
  const channel = interaction.options.getChannel("channel");

  const update = {};
  update[channelType] = channel.id;

  await Channel.findOneAndUpdate({}, update, { upsert: true });

  await interaction.reply(
    `El canal <#${channel.id}> ha sido configurado como el canal ${channelType}.`
  );
}

export default { data, execute: adminOnly(execute) };