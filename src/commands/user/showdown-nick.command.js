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
      .setRequired(true)
  );

async function execute(interaction) {
  const user = interaction.user;

  const newNick = interaction.options.getString("nick");

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user.id },
      { $set: { showdownNick: newNick } },
      { new: true }
    );

    await interaction.reply(
      `¡Nick de Showdown actualizado exitosamente para ${user.username}! Nuevo Nick de Showdown: ${updatedUser.showdownNick}`
    );
  } catch (error) {
    console.error(error);
    await interaction.reply("Hubo un error al actualizar el Nick de Showdown.");
  }
}

export default { data, execute };
