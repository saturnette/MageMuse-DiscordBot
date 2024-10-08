import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import User from "../../models/user.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";

const data = new SlashCommandBuilder()
  .setName("set-elo")
  .setDescription("Establece el ELO de un usuario")
  .addUserOption((option) =>
    option
      .setName("usuario")
      .setDescription("El usuario al que se le establecerá el ELO")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("elo")
      .setDescription("El nuevo ELO del usuario")
      .setRequired(true)
  );

async function execute(interaction) {

  const user = interaction.options.getUser("usuario");
  const elo = interaction.options.getInteger("elo");

  if (!user || !elo) {
    await interaction.reply({
      content: "Por favor, proporciona un usuario y un ELO.",
      ephemeral: true,
    });
    return;
  }

  const userId = user.id;
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    { elo: elo },
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
    `ELO de ${user.username} ha sido establecido a ${elo}.`
  );
}

export default { data, execute: adminOnly(execute) };