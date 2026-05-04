import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const cooldowns = new Map();

const data = new SlashCommandBuilder()
  .setName("set-win-pokemon-champions")
  .setDescription("Registra una victoria en Pokemon Champions")
  .addUserOption((option) =>
    option
      .setName("ganador")
      .setDescription("El usuario que ganó")
      .setRequired(true)
  );

async function execute(interaction) {
  const winner = interaction.options.getUser("ganador");
  const caller = interaction.user;

  const now = Date.now();
  const cooldownAmount = 120 * 1000;

  if (cooldowns.has(caller.id)) {
    const expirationTime = cooldowns.get(caller.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      await interaction.reply({
        content: `Por favor, espera ${timeLeft.toFixed(
          1
        )} segundos antes de usar este comando nuevamente.`,
        ephemeral: true,
      });
      return;
    }
  }

  cooldowns.set(caller.id, now);

  await interaction.reply({ content: "Registrando victoria...", fetchReply: true });

  if (winner.id === caller.id) {
    await interaction.editReply(
      "No puedes registrar una victoria para ti mismo."
    );
    return;
  }

  try {
    // Actualizar al ganador
    const winnerUser = await User.findOneAndUpdate(
      { _id: winner.id },
      {
        $inc: { wins: 1 },
        $setOnInsert: {
          username: winner.username,
          wins: 1,
        },
      },
      { upsert: true, new: true }
    );

    await interaction.editReply(
      `¡Victoria registrada para ${winner.username}! Total de victorias en Pokemon Champions: ${winnerUser.wins}`
    );
  } catch (error) {
    console.error(error);
    await interaction.editReply(
      "Hubo un error al intentar registrar la victoria. Por favor, inténtalo nuevamente más tarde."
    );
  }
}

export default { data, execute };
