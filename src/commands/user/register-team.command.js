import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import User from "../../models/user.model.js";
import Channel from "../../models/channel.model.js";
import { lobbyChannelOnly } from "../../middlewares/channel.middleware.js";

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

  if (!registerChannelId) {
    await interaction.reply("No se pudo encontrar el canal de registro.");
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

export default { data, execute: lobbyChannelOnly(execute) };