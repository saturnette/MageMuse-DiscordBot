import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import User from "../../models/user.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";

const data = new SlashCommandBuilder()
  .setName("give-money")
  .setDescription("Da dinero a un usuario")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario al que deseas dar dinero")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("amount")
      .setDescription("La cantidad de dinero a dar")
      .setRequired(true)
  );

async function execute(interaction) {
  const userToGive = interaction.options.getUser("user");
  const amount = interaction.options.getInteger("amount");

  const user = await User.findOne({ _id: userToGive.id });

  if (!user) {
    await interaction.reply("El usuario especificado no existe.");
    return;
  }

  user.coins += amount;
  await user.save();

  await interaction.reply(
    `El usuario ${userToGive.username} ha recibido ${amount} coins exitosamente.`
  );
}

export default { data, execute: adminOnly(execute) };