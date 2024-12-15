import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import User from "../../models/user.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";

const data = new SlashCommandBuilder()
  .setName("set-losses")
  .setDescription("Establece las derrotas de un usuario")
  .addUserOption((option) =>
    option
      .setName("usuario")
      .setDescription("El usuario al que se le establecerán las derrotas")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("losses")
      .setDescription("El número de derrotas del usuario")
      .setRequired(true)
  );

async function execute(interaction) {
  const user = interaction.options.getUser("usuario");
  const losses = interaction.options.getInteger("losses");

  if (!user || losses === null) {
    await interaction.reply({
      content: "Por favor, proporciona un usuario y un número de derrotas.",
      ephemeral: true,
    });
    return;
  }

  const userId = user.id;
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { lossesLadder: losses },
    { new: true }
  );

  if (!updatedUser) {
    await interaction.reply({
      content: "No se pudo encontrar o actualizar el usuario.",
      ephemeral: true,
    });
    return;
  }

  await interaction.reply(
    `Las derrotas de ${user.username} han sido establecidas a ${losses}.`
  );
}

export default { data, execute: adminOnly(execute) };