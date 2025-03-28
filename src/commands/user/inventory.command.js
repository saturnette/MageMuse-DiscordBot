import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("inventory")
  .setDescription("Muestra las piedras y el cable link que tienes.");

async function execute(interaction) {
  const user = await User.findById(interaction.user.id);

  const inventoryEmbed = new EmbedBuilder()
    .setColor(0xffbf00)
    .setTitle("Tu Inventario")
    .addFields(
      { name: "🔥 Fire Stones", value: `${user.stones.fire || 0}`, inline: true },
      { name: "💧 Water Stones", value: `${user.stones.water || 0}`, inline: true },
      { name: "⚡ Thunder Stones", value: `${user.stones.thunder || 0}`, inline: true },
      { name: "🍃 Leaf Stones", value: `${user.stones.leaf || 0}`, inline: true },
      { name: "🌙 Moon Stones", value: `${user.stones.moon || 0}`, inline: true },
      { name: "🔗 Link Cables", value: `${user.linkCable || 0}`, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [inventoryEmbed] });
}

export default { data, execute };