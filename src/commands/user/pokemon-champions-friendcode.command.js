import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("pokemon-champions-friendcode")
  .setDescription(
    "Ingresa tu código de amigo de Pokemon Champions para que otros entrenadores puedan agregarte"
  )
  .addStringOption((option) =>
    option
      .setName("friendcode")
      .setDescription("Tu código de amigo de Pokemon Champions")
      .setRequired(true)
  );

async function execute(interaction) {
  const user = interaction.user;
  const friendCode = interaction.options.getString("friendcode");

  try {
    // Buscar al usuario en la base de datos
    let existingUser = await User.findOne({ _id: user.id });

    // Si no existe, crearlo
    if (!existingUser) {
      existingUser = new User({
        _id: user.id,
        username: user.username,
        pokemonChampionsFriendCode: friendCode,
      });
      await existingUser.save();
      await interaction.reply(
        `¡Usuario creado exitosamente! Código de amigo de Pokemon Champions asignado: ${friendCode}`
      );
      return;
    }

    // Actualizar el código de amigo del usuario existente
    const updatedUser = await User.findOneAndUpdate(
      { _id: user.id },
      { $set: { pokemonChampionsFriendCode: friendCode } },
      { new: true }
    );

    await interaction.reply(
      `¡Código de amigo de Pokemon Champions actualizado exitosamente para ${user.username}! Nuevo código: ${updatedUser.pokemonChampionsFriendCode}`
    );
  } catch (error) {
    console.error(error);
    await interaction.reply(
      "Hubo un error al intentar actualizar tu código de amigo de Pokemon Champions. Por favor, inténtalo nuevamente más tarde."
    );
  }
}

export default { data, execute };
