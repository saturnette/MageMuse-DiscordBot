import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";
import Channel from "../../models/channel.model.js";

const data = new SlashCommandBuilder()
  .setName("remove-pokemon")
  .setDescription("¡Remueve un Pokémon de tu equipo!")
  .addStringOption((option) =>
    option
      .setName("pokemon")
      .setDescription("Este Pokémon será removido de tu equipo.")
      .setRequired(true)
  );

async function execute(interaction) {
  // Obtener el ID del canal lobby desde la base de datos
  const channelData = await Channel.findOne({});
  const lobbyChannelId = channelData?.lobby;

  if (!lobbyChannelId) {
    await interaction.reply("No se ha configurado el canal de lobby. Usa el comando **/set-lobby** para configurarlo.");
    return;
  }

  // Verificar si el comando se está usando en el canal lobby
  if (interaction.channel.id !== lobbyChannelId) {
    await interaction.reply("Este comando solo puede ser usado en el canal de lobby.");
    return;
  }

  const pokemonToRemove = interaction.options
    .getString("pokemon")
    .toLowerCase();

  const user = await User.findById(interaction.user.id);

  if (user.registered) {
    await interaction.reply(
      "Ya estás registrado en la liga y no puedes eliminar ningún Pokémon de tu equipo."
    );
    return;
  }

  if (!user.team.includes(pokemonToRemove)) {
    await interaction.reply(
      `No tienes el Pokémon ${pokemonToRemove} en tu equipo.`
    );
    return;
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: interaction.user.id },
      { $pull: { team: pokemonToRemove } },
      { new: true }
    );

    await interaction.reply(
      `¡Pokémon eliminado exitosamente de tu equipo! Nuevo equipo: ${updatedUser.team.join(
        ", "
      )}`
    );
  } catch (error) {
    console.error(error);
    await interaction.reply("Hubo un error al eliminar el Pokémon del equipo.");
  }
}

export default { data, execute };