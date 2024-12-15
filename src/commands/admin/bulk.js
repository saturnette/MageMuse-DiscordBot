import { SlashCommandBuilder, PermissionsBitField } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("clearuser")
  .setDescription("Elimina todos los mensajes de un usuario específico en un rango de fechas.")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario cuyos mensajes deseas eliminar")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("startdate")
      .setDescription("Fecha de inicio en formato YYYY-MM-DD")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("enddate")
      .setDescription("Fecha de fin en formato YYYY-MM-DD")
      .setRequired(true)
  );

async function execute(interaction) {
  // Verificar si el usuario tiene permisos de administrador
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: 'No tienes permisos para usar este comando.', ephemeral: true });
  }

  const user = interaction.options.getUser('user');
  const startDate = new Date(interaction.options.getString('startdate'));
  const endDate = new Date(interaction.options.getString('enddate'));
  const channel = interaction.channel;

  // Confirmar la acción
  await interaction.reply({ content: `Eliminando todos los mensajes de ${user.tag} desde ${startDate.toDateString()} hasta ${endDate.toDateString()}...`, ephemeral: true });

  // Obtener y eliminar los mensajes del canal
  let fetched;
  let messagesDeleted = 0;
  let lastMessageId;
  do {
    fetched = await channel.messages.fetch({ limit: 100, before: lastMessageId });
    const userMessages = fetched.filter(msg => 
      msg.author.id === user.id && 
      msg.createdAt >= startDate && 
      msg.createdAt <= endDate
    );

    for (const message of userMessages.values()) {
      if (message.deletable) {
        await message.delete();
        messagesDeleted++;
      }
    }

    lastMessageId = fetched.last()?.id;

    // Actualizar el progreso
    await interaction.editReply({ content: `Eliminando mensajes... ${messagesDeleted} mensajes eliminados hasta ahora.`, ephemeral: true });
  } while (fetched.size >= 100);

  await interaction.editReply({ content: `Se han eliminado ${messagesDeleted} mensajes de ${user.tag} en el rango de fechas especificado.`, ephemeral: true });
}

export default { data, execute };