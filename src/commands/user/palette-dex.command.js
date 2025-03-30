import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("palette-dex")
  .setDescription("Muestra la lista de todos tus Pokémon ordenados numéricamente.")
  .addUserOption(option =>
    option.setName('user')
      .setDescription('El usuario del que deseas saber los Pokémon.'));

async function execute(interaction) {
  const targetUser = interaction.options.getUser('user') || interaction.user;

  const user = await User.findById(targetUser.id);

  if (!user || !user.catcher) {
    await interaction.reply("El usuario no está registrado o no tiene Pokémon.");
    return;
  }

  const sortedPokemon = user.pokemonCollection.sort((a, b) => a.number - b.number);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedPokemon.length / itemsPerPage);
  let currentPage = 1;

  const generateEmbed = (page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPokemon = sortedPokemon.slice(startIndex, endIndex);
  
    const profileLink = `https://palette-dex.vercel.app/profile/${user.id}`;
  
    return new EmbedBuilder()
      .setColor(0xffbf00)
      .setTitle(`Pokémon de ${targetUser.username}`)
      .setDescription(
        paginatedPokemon
          .map(p => `**#${p.number} ${p.name}** (x${p.count})`)
          .join("\n")
      )
      .setFooter({ text: `Página ${page} de ${totalPages} | Visita tu perfil aquí: ${profileLink}` });
  };

  const generateRow = (page) => {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('➡️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages)
      );
  };

  const response = await interaction.reply({ embeds: [generateEmbed(currentPage)], components: [generateRow(currentPage)], fetchReply: true });

  const filter = i => i.user.id === interaction.user.id;
  const collector = response.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async i => {
    if (i.customId === 'prev' && currentPage > 1) {
      currentPage--;
    } else if (i.customId === 'next' && currentPage < totalPages) {
      currentPage++;
    }

    await i.update({ embeds: [generateEmbed(currentPage)], components: [generateRow(currentPage)] });
  });

  collector.on('end', collected => {
    response.edit({ components: [] });
  });
}

export default { data, execute };