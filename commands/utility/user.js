import { SlashCommandBuilder } from "discord.js";

// Creamos un nuevo comando slash usando SlashCommandBuilder
// Establecemos el nombre del comando como "user"
// Y la descripción del comando como "Provides information about the user."
const data = new SlashCommandBuilder()
  .setName("user")
  .setDescription("Provides information about the user.");

// Definimos la función que se ejecutará cuando se use el comando
// Esta función es asíncrona para poder usar 'await' dentro de ella
async function execute(interaction) {
  // Respondemos a la interacción (el comando slash) con una imagen
  // Adjuntamos un archivo de imagen usando el método 'reply' de la interacción
  await interaction.reply({
    content: `This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`,
    files: [{
      attachment: 'https://itaku.ee/api/media/gallery_imgs/20230811_Quaxly_PMD_PFP_LBTLaU3/xl_RBWkEMF.jpg', // Reemplaza 'URL_DE_LA_IMAGEN' con la URL de la imagen que deseas enviar
      name: 'image.png' // Nombre del archivo adjunto
    }]
  });
}

// Exportamos el comando (la data y la función execute) como un objeto
export default { data, execute };
