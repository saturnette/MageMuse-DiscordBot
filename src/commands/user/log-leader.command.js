import User from "../../models/user.model.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("log-leader")
  .setDescription("Muestra el rendimiento de los líderes de gimnasio.");

async function execute(interaction) {
  try {
    const users = await User.find({ badgeType: { $exists: true, $ne: null } });

    users.sort((a, b) => b.wins + b.loses - (a.wins + a.loses));

    const embed = new EmbedBuilder()
      .setTitle("Log de Líderes de Gimnasio")
      .setDescription(
        "Estos son los líderes de gimnasio con mejor rendimiento."
      );

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const discordUser = await interaction.client.users.fetch(user._id);

      const username = discordUser ? discordUser.username : 'Usuario desconocido';

      embed.addFields({
        name: `#${i + 1} ${username}`,
        value: `Wins: ${user.wins || 0}, Losses: ${user.loses || 0}, Total: ${user.wins + user.loses || 0}`,
      });
    }

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Ha ocurrido un error obteniendo los datos.",
      ephemeral: true,
    });
  }
}

export default { data, execute };
