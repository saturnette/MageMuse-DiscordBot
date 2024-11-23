import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const MAX_FACTS = 10;

const data = new SlashCommandBuilder()
  .setName("register-fact")
  .setDescription("Registra una nueva frase")
  .addStringOption(option => 
    option.setName('fact')
      .setDescription('La frase que quieres registrar')
      .setRequired(true)
  );

async function execute(interaction) {
  await interaction.deferReply();

  const userId = interaction.user.id;
  const fact = interaction.options.getString('fact');

  let user = await User.findById(userId);
  if (!user) {
    user = new User({ _id: userId, facts: [] });
  }

  if (user.facts.length >= MAX_FACTS) {
    await interaction.editReply(`Has alcanzado el límite de ${remainingFacts} factos registrados.`);
    return;
  }

  user.facts.push(fact);
  await user.save();

  const remainingFacts = MAX_FACTS - user.facts.length;

  await interaction.editReply(`Y ese facto que acabas de soltar papu. Aún puedes soltar ${remainingFacts} factos más. Bobipapip.`);
}

export default { data, execute };