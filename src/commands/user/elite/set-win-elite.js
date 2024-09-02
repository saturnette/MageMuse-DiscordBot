import { SlashCommandBuilder } from "discord.js";
import User from "../../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("set-win-elite")
  .setDescription("Registra una victoria del alto mando.")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario que ha perdido.")
      .setRequired(true)
  );

async function execute(interaction) {
  if (!interaction.member.roles.cache.has('1190733087018065930')) {
    await interaction.reply('Necesitas ser alto mando para usar este comando.');
    return;
  }
  const recipientUser = interaction.options.getUser("user");
  
  const userProfile = await User.findById(recipientUser.id);

  if (userProfile.tryEF === 0) {
    await interaction.reply(
      `${recipientUser.username} no tiene intentos, no puedes ganarle.`
    );
    return;
  }

  userProfile.tryEF -= 1;

  await userProfile.save();

  await interaction.reply(
    `${recipientUser.username} ha perdido, ha gastado un boleto al alto mando.`
  );
}

export default { data, execute };
