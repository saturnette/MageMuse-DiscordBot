import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("showdown-nick")
  .setDescription(
    "Ingresa tu nick de Showdown para que puedas ser retado por otros entrenadores"
  )
  .addStringOption((option) =>
    option
      .setName("nick")
      .setDescription("El nuevo nick de Showdown")
      .setRequired(false) // Cambiado a no requerido
  );

async function execute(interaction) {
  const user = interaction.user;
  let newNick = interaction.options.getString("nick");

  // Si el nick es nulo o vacío, asignar un valor predeterminado
  if (!newNick || newNick.trim() === "") {
    const randomNumber = Math.floor(Math.random() * 10000); // Generar un número aleatorio
    newNick = `anonimo${randomNumber}`;
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user.id },
      { $set: { showdownNick: newNick } },
      { new: true }
    );

    if (!updatedUser) {
      await interaction.reply(
        "No se pudo encontrar tu usuario en la base de datos. Por favor, verifica tu registro."
      );
      return;
    }

    await interaction.reply(
      `¡Nick de Showdown actualizado exitosamente para ${user.username}! Nuevo Nick de Showdown: ${updatedUser.showdownNick}`
    );
  } catch (error) {
    if (error.code === 11000) {
      // Manejar error de clave duplicada
      await interaction.reply(
        "El Nick de Showdown que intentas usar ya está en uso. Por favor, elige otro."
      );
    } else {
      console.error(error);
      await interaction.reply(
        "Hubo un error al intentar actualizar tu Nick de Showdown. Por favor, inténtalo nuevamente más tarde."
      );
    }
  }
}

export default { data, execute };