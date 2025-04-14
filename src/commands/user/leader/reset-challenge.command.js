import User from "../../../models/user.model.js";
import { logChannelOnly } from "../../../middlewares/channel.middleware.js";
import { leaderRoleOnly } from "../../../middlewares/rol.middleware.js";
import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("reset-bo3")
  .setDescription("Elimina el progreso del Bo3 entre un líder y un retador.")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario retador cuyo Bo3 deseas eliminar.")
      .setRequired(true)
  );

async function execute(interaction) {
  await interaction.deferReply();

  const recipientUser = interaction.options.getUser("user");
  const leaderId = interaction.user.id;

  try {
    const challenger = await User.findById(recipientUser.id);
    const leader = await User.findById(leaderId);

    if (!challenger || !leader) {
      throw new Error("No se encontró el perfil del líder o del retador.");
    }

    if (!challenger.bo3Progress.has(leaderId)) {
      await interaction.followUp(
        `No hay un Bo3 registrado entre <@${leaderId}> y <@${recipientUser.id}>.`
      );
      return;
    }

    // Obtener el progreso del Bo3
    const bo3 = challenger.bo3Progress.get(leaderId);

    // Calcular los intentos utilizados en el Bo3
    const totalAttempts = bo3.leaderWins + bo3.challengerWins;

    // Restar los intentos del campo tryDay
    challenger.tryDay = Math.max(0, challenger.tryDay - totalAttempts);

    // Eliminar el progreso del Bo3
    challenger.bo3Progress.delete(leaderId);

    // Indicar que bo3Progress fue modificado
    challenger.markModified("bo3Progress");

    // Guardar los cambios
    await challenger.save();

    await interaction.followUp(
      `El progreso del Bo3 entre <@${leaderId}> y <@${recipientUser.id}> ha sido eliminado.`
    );
  } catch (error) {
    console.error(error);
    await interaction.followUp(
      "Hubo un error al intentar eliminar el progreso del Bo3."
    );
  }
}

export default { data, execute: leaderRoleOnly(logChannelOnly(execute)) };