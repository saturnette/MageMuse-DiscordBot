import Channel from "../models/channel.model.js";

async function sendErrorMessage(interaction, message) {
  await interaction.reply(message);
}

export function logChannelOnly(commandExecute) {
  return async function (interaction) {
    await checkChannel(interaction, "log", commandExecute);
  };
}

export function ladderChannelOnly(commandExecute) {
  return async function (interaction) {
    await checkChannel(interaction, "ladder", commandExecute);
  };
}

export function lobbyChannelOnly(commandExecute) {
  return async function (interaction) {
    await checkChannel(interaction, "lobby", commandExecute);
  };
}

async function checkChannel(interaction, channelType, commandExecute) {
    const channelData = await Channel.findOne({});
    const channelId = channelData?.[channelType];
  
    if (!channelId) {
      await sendErrorMessage(
        interaction,
        `No se ha configurado el canal de ${channelType}.\nUsa el comando **/set-channel** para configurarlo.`
      );
      return;
    }
  
    const channel = interaction.guild.channels.cache.get(channelId);
    const channelLink = channel ? `<#${channelId}>` : `el canal de ${channelType}`;
  
    if (interaction.channel.id !== channelId) {
      await sendErrorMessage(
        interaction,
        `Este comando solo puede ser usado en ${channelLink}.`
      );
      return;
    }
  
    await commandExecute(interaction);
  }