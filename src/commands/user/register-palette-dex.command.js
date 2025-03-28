import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("register-palette-dex")
  .setDescription("Regístrate en el Palette Dex eligiendo tu Pokémon inicial y color favorito.")
  .addStringOption(option =>
    option.setName('color')
      .setDescription('Elige tu color favorito')
      .setRequired(true)
      .addChoices(
        { name: 'Azul', value: 'blue' },
        { name: 'Rojo', value: 'red' }
      ));

async function execute(interaction) {
  const user = await User.findById(interaction.user.id);

  if (user && user.catcher) {
    await interaction.reply("Ya estás registrado en el Palette Dex.");
    return;
  }

  const favoriteColor = interaction.options.getString('color');
  const color = favoriteColor === 'blue' ? 'Azul 🟦' : 'Rojo 🟥';

  const starterEmbed = new EmbedBuilder()
    .setColor(0xffbf00)
    .setTitle("Elige tu Pokémon inicial")
    .setDescription("Selecciona uno de los siguientes Pokémon iniciales:")
    .addFields(
      { name: "Bulbasaur", value: "🌱", inline: true },
      { name: "Squirtle", value: "💧", inline: true },
      { name: "Charmander", value: "🔥", inline: true }
    );

  const starterRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulbasaur')
        .setLabel('Bulbasaur')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('squirtle')
        .setLabel('Squirtle')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('charmander')
        .setLabel('Charmander')
        .setStyle(ButtonStyle.Primary)
    );

  await interaction.reply({ embeds: [starterEmbed], components: [starterRow] });
  const response = await interaction.fetchReply();

  const starterFilter = i => i.user.id === interaction.user.id;
  const starterCollector = response.createMessageComponentCollector({ filter: starterFilter, time: 60000 });

  starterCollector.on('collect', async i => {
    let starter;
    let starterId;

    switch (i.customId) {
      case 'bulbasaur':
        starter = 'Bulbasaur';
        starterId = 1;
        break;
      case 'squirtle':
        starter = 'Squirtle';
        starterId = 7;
        break;
      case 'charmander':
        starter = 'Charmander';
        starterId = 4;
        break;
    }

    await User.findByIdAndUpdate(interaction.user.id, {
      catcher: true,
      favoriteColor: favoriteColor,
      $push: { pokemonCollection: { number: starterId, name: starter, count: 1 } }
    });

    await i.update({
      content: `¡Registro completado! Has elegido a ${starter} y tu color favorito es ${color}.`,
      embeds: [],
      components: []
    });

    starterCollector.stop();
  });
}

export default { data, execute };