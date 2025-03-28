import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import User from "../../models/user.model.js";
import axios from "axios";

const data = new SlashCommandBuilder()
  .setName("trade-pokemon")
  .setDescription("Intercambia Pokémon con otro usuario.")
  .addUserOption(option =>
    option.setName('user')
      .setDescription('El usuario con el que deseas intercambiar.')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('your_pokemon')
      .setDescription('El número del Pokémon que deseas intercambiar.')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('their_pokemon')
      .setDescription('El número del Pokémon que deseas recibir.')
      .setRequired(true));

const evolutions = {
  93: { number: 94, name: 'Gengar' }, // Haunter -> Gengar
  75: { number: 76, name: 'Golem' }, // Graveler -> Golem
  64: { number: 65, name: 'Alakazam' }, // Kadabra -> Alakazam
  67: { number: 68, name: 'Machamp' } // Machoke -> Machamp
};

async function execute(interaction) {
  const user1 = await User.findById(interaction.user.id);
  const user2 = await User.findById(interaction.options.getUser('user').id);
  const yourPokemonNumber = interaction.options.getInteger('your_pokemon');
  const theirPokemonNumber = interaction.options.getInteger('their_pokemon');

  if (!user1 || !user2 || !user1.catcher || !user2.catcher) {
    await interaction.reply("Uno de los usuarios no está registrado.");
    return;
  }

  if (user1.linkCable <= 0) {
    await interaction.reply("No tienes un link cable para realizar el intercambio.");
    return;
  }

  const yourPokemon = user1.pokemonCollection.find(p => p.number === yourPokemonNumber);
  const theirPokemon = user2.pokemonCollection.find(p => p.number === theirPokemonNumber);

  if (!yourPokemon || !theirPokemon) {
    await interaction.reply("Uno de los usuarios no tiene el Pokémon especificado.");
    return;
  }

  if (yourPokemon.count < 2 || theirPokemon.count < 2) {
    await interaction.reply("Ambos usuarios deben tener más de una copia del Pokémon que desean intercambiar.");
    return;
  }

  const confirmEmbed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("Solicitud de intercambio")
    .setDescription(`${interaction.user.username} quiere intercambiar su ${yourPokemon.name} por tu ${theirPokemon.name}. ¿Aceptas?`);

  const confirmRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('accept')
        .setLabel('Aceptar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('decline')
        .setLabel('Rechazar')
        .setStyle(ButtonStyle.Danger)
    );

  const response = await interaction.reply({ content: `<@${user2._id}>`, embeds: [confirmEmbed], components: [confirmRow], fetchReply: true });

  const filter = i => i.user.id === user2._id;
  const collector = response.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async i => {
    if (i.customId === 'accept') {
      yourPokemon.count -= 1;
      theirPokemon.count -= 1;

      const user1Pokemon = user1.pokemonCollection.find(p => p.number === theirPokemonNumber);
      const user2Pokemon = user2.pokemonCollection.find(p => p.number === yourPokemonNumber);

      if (user1Pokemon) {
        user1Pokemon.count += 1;
      } else {
        user1.pokemonCollection.push({ number: theirPokemon.number, name: theirPokemon.name, count: 1 });
      }

      if (user2Pokemon) {
        user2Pokemon.count += 1;
      } else {
        user2.pokemonCollection.push({ number: yourPokemon.number, name: yourPokemon.name, count: 1 });
      }

      let evolutionMessage = "";

      // Evolución de Pokémon para user2
      if (evolutions[yourPokemonNumber]) {
        const evolution = evolutions[yourPokemonNumber];
        const spriteResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${evolution.number}`);
        const spriteUrl = spriteResponse.data.sprites.front_default;

        user2.pokemonCollection = user2.pokemonCollection.map(p =>
          p.number === yourPokemonNumber ? { ...p, number: evolution.number, name: evolution.name } : p
        );

        evolutionMessage += `¡El Pokémon **${yourPokemon.name}** de ${user2.username} ha evolucionado a **${evolution.name}**!\n`;
        evolutionMessage += `![Evolución](${spriteUrl})\n`;
      }

      // Evolución de Pokémon para user1
      if (evolutions[theirPokemonNumber]) {
        const evolution = evolutions[theirPokemonNumber];
        const spriteResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${evolution.number}`);
        const spriteUrl = spriteResponse.data.sprites.front_default;

        user1.pokemonCollection = user1.pokemonCollection.map(p =>
          p.number === theirPokemonNumber ? { ...p, number: evolution.number, name: evolution.name } : p
        );

        evolutionMessage += `¡El Pokémon **${theirPokemon.name}** de ${user1.username} ha evolucionado a **${evolution.name}**!\n`;
        evolutionMessage += `![Evolución](${spriteUrl})\n`;
      }

      user1.linkCable -= 1;

      await user1.save();
      await user2.save();

      await i.update({
        content: `¡Intercambio completado! Has intercambiado tu **${yourPokemon.name}** por el **${theirPokemon.name}** de ${interaction.user.username}.\n\n${evolutionMessage}`,
        embeds: [],
        components: []
      });
    } else {
      await i.update({ content: `El intercambio ha sido rechazado.`, embeds: [], components: [] });
    }
    collector.stop();
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      interaction.editReply({ content: `El intercambio ha expirado.`, embeds: [], components: [] });
    }
  });
}

export default { data, execute };