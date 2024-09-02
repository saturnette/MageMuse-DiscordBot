import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import User from "../../models/user.model.js";
import Channel from "../../models/channel.model.js";

const data = new SlashCommandBuilder()
  .setName("register-team")
  .setDescription("Registra tu equipo de Pokémon para participar en la liga");

async function execute(interaction) {
  const user = await User.findById(interaction.user.id);

  if (user.registered) {
    await interaction.reply("Ya estás registrado en la liga.");
    return;
  }
  if (!user.team || user.team.length === 0) {
    await interaction.reply("No tienes ningún Pokémon en tu equipo.");
    return;
  }

  // Obtener el ID del canal register y lobby desde la base de datos
  const channelData = await Channel.findOne({});
  const registerChannelId = channelData?.register;
  const lobbyChannelId = channelData?.lobby;

  if (!registerChannelId) {
    await interaction.reply("No se pudo encontrar el canal de registro.");
    return;
  }

  if (!lobbyChannelId) {
    await interaction.reply("No se ha configurado el canal de lobby. Usa el comando **/set-lobby** para configurarlo.");
    return;
  }
  // Verificar si el comando se está usando en el canal lobby
  if (interaction.channel.id !== lobbyChannelId) {
    await interaction.reply("Este comando solo puede ser usado en el canal de lobby.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(
      `Registro de ${interaction.user.globalName} (${interaction.user.username})`
    )
    .addFields({
      name: "Pokémon Team",
      value: user.team.join(", "),
      inline: true,
    })
    .setColor("#0099ff");

  const channel = interaction.client.channels.cache.get(registerChannelId);
  await channel.send({ embeds: [embed] });

  user.registered = true;
  await user.save();

  await interaction.reply("¡Te has registrado exitosamente en la liga!");
}

export default { data, execute };