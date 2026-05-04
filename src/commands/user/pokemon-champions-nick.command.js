import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("pokemon-champions-nick")
  .setDescription(
    "Ingresa tu username de Pokemon Champions para que puedas ser retado por otros entrenadores"
  )
  .addStringOption((option) =>
    option
      .setName("nick")
      .setDescription("El nuevo username de Pokemon Champions")
      .setRequired(false)
  );

async function execute(interaction) {
  const user = interaction.user;
  let newNick = interaction.options.getString("nick");

  // Si el nick es nulo o vacío, asignar un valor predeterminado
  if (!newNick || newNick.trim() === "") {
    const randomNumber = Math.floor(Math.random() * 10000);
    newNick = `anonimo${randomNumber}`;
  }

  try {
    // Buscar al usuario en la base de datos
    let existingUser = await User.findOne({ _id: user.id });

    // Si no existe, crearlo
    if (!existingUser) {
      existingUser = new User({
        _id: user.id,
        username: user.username,
        pokemonChampionsNick: newNick,
      });
      await existingUser.save();
      await interaction.reply(
        `¡Usuario creado exitosamente! Username de Pokemon Champions asignado: ${newNick}`
      );
      return;
    }

    // Actualizar el username del usuario existente
    const updatedUser = await User.findOneAndUpdate(
      { _id: user.id },
      { $set: { pokemonChampionsNick: newNick } },
      { new: true }
    );

    await interaction.reply(
      `¡Username de Pokemon Champions actualizado exitosamente para ${user.username}! Nuevo Username: ${updatedUser.pokemonChampionsNick}`
    );
  } catch (error) {
    if (error.code === 11000) {
      // Manejar error de clave duplicada
      await interaction.reply(
        "El username de Pokemon Champions que intentas usar ya está en uso. Por favor, elige otro."
      );
    } else {
      console.error(error);
      await interaction.reply(
        "Hubo un error al intentar actualizar tu username de Pokemon Champions. Por favor, inténtalo nuevamente más tarde."
      );
    }
  }
}

export default { data, execute };
