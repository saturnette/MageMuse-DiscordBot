import { SlashCommandBuilder } from "discord.js";
import User from "../../../models/user.model.js";
import { logChannelOnly } from "../../../middlewares/channel.middleware.js";
import { eliteRoleOnly } from "../../../middlewares/rol.middleware.js";

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

  const recipientUser = interaction.options.getUser("user");

  const userProfile = await User.findOneAndUpdate(
    { _id: recipientUser.id },
    { $setOnInsert: { registered: false } },
    { new: true, upsert: true }
  );

  if (!userProfile.registered) {
    await interaction.reply(`${recipientUser.username} no está registrado en la liga.`);
    return;
  }

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

export default { data, execute: eliteRoleOnly(logChannelOnly(execute)) };