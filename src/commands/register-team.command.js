import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import User from "../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("register-team")
  .setDescription("Registra tu equipo de Pokémon para participar en la liga");

async function execute(interaction) {
  const user = await User.findById(interaction.user.id);

  if (user.registered) {
    await interaction.reply("Ya estás registrado en la liga.");
    return;
  }
  if (!user.team || user.team.length === 0) {
    await interaction.reply("No tienes ningún Pokémon en tu equipo.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(
      `Registro de ${interaction.user.globalName} (${interaction.user.username})`
    )
    .addFields({
      name: "Pokémon Team",
      value: user.team.join(", "),
      inline: true,
    })
    .setColor("#0099ff");

  const channel = interaction.client.channels.cache.get("1238722863557509181");
  await channel.send({ embeds: [embed] });

  user.registered = true;
  await user.save();

  await interaction.reply("¡Te has registrado exitosamente en la liga!");
}

export default { data, execute };