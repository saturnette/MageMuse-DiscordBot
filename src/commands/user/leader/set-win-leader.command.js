import User from "../../../models/user.model.js";
import { logChannelOnly } from "../../../middlewares/channel.middleware.js";
import { leaderRoleOnly } from "../../../middlewares/rol.middleware.js";
import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("set-win-leader")
  .setDescription("¡Registra una victoria!")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario que ha perdido.")
      .setRequired(true)
  );

async function execute(interaction) {
  const losingUser = interaction.options.getUser("user");

  try {

    const user = await User.findById(losingUser.id);
    if (!user) {
      throw new Error("El usuario no tiene un perfil.");
    }

    if (!user.registered) {
      throw new Error("El retador no está registrado en la liga.");
    }

    if (user.tryDay >= 2) {
      throw new Error(
        "El retador ya ha realizado sus dos intentos de hoy."
      );
    }

    user.tryDay += 1;
    await user.save();

    const leaderProfile = await User.findById(interaction.user.id);

    leaderProfile.wins += 1;
    await leaderProfile.save();

    await interaction.reply(
      `¡<@${interaction.user.id}> ha defendido su gimnasio! El retador <@${losingUser.id}> ha perdido.`
    );
  } catch (error) {
    await interaction.reply(error.message);
  }
}

export default { data, execute: leaderRoleOnly(logChannelOnly(execute)) };