import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import User from "../../models/user.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";

const data = new SlashCommandBuilder()
  .setName("set-wins")
  .setDescription("Establece las victorias de un usuario")
  .addUserOption((option) =>
    option
      .setName("usuario")
      .setDescription("El usuario al que se le establecerán las victorias")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("wins")
      .setDescription("El número de victorias del usuario")
      .setRequired(true)
  );

async function execute(interaction) {
  const user = interaction.options.getUser("usuario");
  const wins = interaction.options.getInteger("wins");

  if (!user || wins === null) {
    await interaction.reply({
      content: "Por favor, proporciona un usuario y un número de victorias.",
      ephemeral: true,
    });
    return;
  }

  const userId = user.id;
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { winsLadder: wins },
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
    `Las victorias de ${user.username} han sido establecidas a ${wins}.`
  );
}

export default { data, execute: adminOnly(execute) };