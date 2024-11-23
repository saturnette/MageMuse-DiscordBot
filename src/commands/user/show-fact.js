import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";

const data = new SlashCommandBuilder()
  .setName("random-fact")
  .setDescription("Muestra una frase al azar de todos los usuarios");

const phrases = [
    "Voy a soltar un facto que muchos no aceptan:",
    "Aunque lloren, este es un facto total:",
    "Aquí va un facto curioso:",
    "¿Sabías que...?",
    "Factura interesante:",
    "Un facto poco conocido:",
    "Algo que quizás no sabías:",
    "Aquí tienes una factura:",
    "Un facto sorprendente:",
    "Un facto que te hará pensar:",
    "¿Bancan esto chat?:",
    "Un facto que te hará reflexionar:",
    "Hoy me desperté con ganas de soltar un facto:",
    "Hoy estoy basada y voy a soltar un facto:",
    "Un facto que cambiará tu perspectiva:",
    "Aquí va un facto que pocos conocen:",
    "Un facto para impresionar a tus amigos:",
    "Este facto es para los curiosos:",
    "Un facto que te dejará boquiabierto:"
];

const emojis = [
    "🤔", "😅", "🧐", "🤓", "📚", "🌟", "💡", "📝", "😲",
    "😃", "😎", "😜", "😇", "😈", "👻", "👽", "🤖", "🎉",
    "🎊", "🎈", "🎁", "🎂", "🍰", "🍕", "🍔", "🍟", "🍿",
    "🍫", "🍬", "🍭", "🍩", "🍪", "🍺", "🍻", "🍷", "🍸"
];

const usedFacts = new Set();

async function execute(interaction) {
  await interaction.deferReply();

  const users = await User.find({ facts: { $exists: true, $ne: [] } });
  const allFacts = users.flatMap(user => user.facts);

  if (allFacts.length === 0) {
    await interaction.editReply("No hay frases registradas.");
    return;
  }

  let randomFact;
  do {
    randomFact = allFacts[Math.floor(Math.random() * allFacts.length)];
  } while (usedFacts.has(randomFact) && usedFacts.size < allFacts.length);

  usedFacts.add(randomFact);

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  await interaction.editReply(`${randomPhrase} ${randomFact} ${randomEmoji}`);
}

export default { data, execute };