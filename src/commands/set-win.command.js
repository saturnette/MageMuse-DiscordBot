import User from "../models/user.model.js";
import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("set-win")
  .setDescription("¡Registra una victoria!")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario que ha perdido.")
      .setRequired(true)
  );

async function execute(interaction) {
  const losingUser = interaction.options.getUser("user");

  if (!interaction.member.roles.cache.has('1239630002987995186')) {
    await interaction.reply('No tienes el rol necesario para usar este comando.');
    return;
  }
  

  try {
    const leaderProfile = await User.findById(interaction.user.id);

    if (!leaderProfile) {
      throw new Error("No tienes permisos para ejecutar este comando.");
    }

    const user = await User.findById(losingUser.id);
    if (!user) {
      throw new Error("El usuario no tiene un perfil");
    }

    if (!user.registered) {
      throw new Error("El retador no está registrado");
    }

    if (user.tryDay >= 2) {
      throw new Error(
        "El retador ya ha realizado sus dos intentos de hoy, lee el registro nmms."
      );
    }

    user.tryDay += 1;
    await user.save();

    leaderProfile.wins += 1;
    await leaderProfile.save();

    await interaction.reply(
      `¡${interaction.user.username} ha defendido su gimnasio! El retador ${losingUser.username} ha perdido.`
    );
  } catch (error) {
    await interaction.reply(error.message);
  }
}

export default { data, execute };