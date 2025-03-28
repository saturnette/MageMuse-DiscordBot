import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("shop")
  .setDescription("Compra artículos en la tienda.")
  .addStringOption((option) =>
    option
      .setName("item")
      .setDescription("El artículo que deseas comprar.")
      .setRequired(true)
      .addChoices(
        { name: "Fire Stone", value: "fire_stone" },
        { name: "Water Stone", value: "water_stone" },
        { name: "Thunder Stone", value: "thunder_stone" },
        { name: "Leaf Stone", value: "leaf_stone" },
        { name: "Moon Stone", value: "moon_stone" },
        { name: "Link Cable", value: "link_cable" }
      )
  );

const prices = {
  fire_stone: 90,
  water_stone: 90,
  thunder_stone: 90,
  leaf_stone: 90,
  moon_stone: 90,
  link_cable: 10,
};

async function execute(interaction) {
  const user = await User.findById(interaction.user.id);
  const item = interaction.options.getString("item");

  if (!prices[item]) {
    await interaction.reply("Artículo no válido. Los artículos disponibles son: fire_stone, water_stone, thunder_stone, leaf_stone, moon_stone, link_cable.");
    return;
  }

  if (user.coins < prices[item]) {
    await interaction.reply(`No tienes suficientes coins. Necesitas ${prices[item]} coins para comprar ${item}.`);
    return;
  }

  user.coins -= prices[item];
  if (item === "link_cable") {
    user.linkCable += 1;
  } else {
    user.stones[item.split("_")[0]] += 1;
  }

  await user.save();
  await interaction.reply(`Has comprado ${item.replace("_", " ")} por ${prices[item]} coins.`);
}

export default { data, execute };