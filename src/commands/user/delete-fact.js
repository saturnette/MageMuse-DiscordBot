import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("delete-fact")
  .setDescription("Borra una frase registrada")
  .addStringOption(option => 
    option.setName('fact')
      .setDescription('La frase que quieres borrar')
      .setRequired(true)
      .setAutocomplete(true)
  );

async function execute(interaction) {
  await interaction.deferReply();

  const user = await User.findById(interaction.user.id);
  const fact = interaction.options.getString('fact');

  const factIndex = user.facts.indexOf(fact);
  if (factIndex === -1) {
    await interaction.editReply("No se encontró la frase especificada.");
    return;
  }

  user.facts.splice(factIndex, 1);
  await user.save();

  await interaction.editReply(`El infacto "${fact}" ha sido borrado. Bobipapip.`);
}

async function autocomplete(interaction) {
  const user = await User.findById(interaction.user.id);
  const focusedValue = interaction.options.getFocused();
  const filtered = user.facts.filter(fact => fact.startsWith(focusedValue));
  await interaction.respond(
    filtered.map(fact => ({ name: fact, value: fact }))
  );
}

export default { data, execute, autocomplete };