import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import User from "../../models/user.model.js";
import Channel from "../../models/channel.model.js";
import { lobbyChannelOnly } from "../../middlewares/channel.middleware.js";
import { generateAndSaveProfileImage } from "../../utils/image-generator.js";

const data = new SlashCommandBuilder()
  .setName("register-team")
  .setDescription("Registra tu equipo de Pokémon para participar en la liga");

async function execute(interaction) {
  await interaction.deferReply(); 

  const user = await User.findById(interaction.user.id);

  if (user.registered) {
    await interaction.editReply("Ya estás registrado en la liga.");
    return;
  }
  if (!user.team || user.team.length === 0) {
    await interaction.editReply("No tienes ningún Pokémon en tu equipo.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`Registro de ${interaction.user.globalName} (${interaction.user.username})`)
    .addFields({
      name: "Pokémon Team",
      value: user.team.join(", "),
      inline: true,
    })
    .setColor("#0099ff");

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirmar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Secondary)
    );

  await interaction.editReply({
    content: "¿Estás seguro que deseas registrar este equipo? \n\n**Una vez registrado el equipo no lo podrás cambiar.**",
    embeds: [embed],
    components: [row]
  });

  const filter = i => i.user.id === interaction.user.id;
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async i => {
    await i.deferUpdate(); 

    if (i.customId === 'confirm') {
      const channelData = await Channel.findOne({});
      const registerChannelId = channelData?.register;

      if (!registerChannelId) {
        await i.followUp({ content: "No se pudo encontrar el canal de registro.", components: [] });
        return;
      }

      const channel = interaction.client.channels.cache.get(registerChannelId);
      await channel.send({ embeds: [embed] });

      user.registered = true;
      await user.save();

      await i.followUp({ content: "¡Te has registrado exitosamente en la liga!", components: [] });

      await generateAndSaveProfileImage(user.id);
    } else if (i.customId === 'cancel') {
      await i.followUp({ content: "Registro cancelado.", components: [] });
    }
  });

  collector.on('end', async collected => {
    if (collected.size === 0) {
      await interaction.editReply({ content: "No se recibió ninguna respuesta. Registro cancelado.", components: [] });
    }
  });
}

export default { data, execute: lobbyChannelOnly(execute) };