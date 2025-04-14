import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";
import { lobbyChannelOnly } from "../../middlewares/channel.middleware.js";

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

  const pokemonToRemove = interaction.options
    .getString("pokemon")
    .toLowerCase();

  const user = await User.findById(interaction.user.id);

  if (user.registered) {
    await interaction.reply(
      "Ya estás registrado en la liga y no puedes eliminar ningún Pokémon de tu equipo. Debiste leer mi mensaje... 😖"
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
          `¡Pokémon eliminado exitosamente de tu equipo! \n\nNuevo equipo:\n${updatedUser.team.join(
        ", "
      )}`
    );
  } catch (error) {
    console.error(error);
    await interaction.reply("Hubo un error al eliminar el Pokémon del equipo.");
  }
}

export default { data, execute: lobbyChannelOnly(execute) };