import User from "../../models/user.model.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Obtiene información de un entrenador.")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario del que quieres obtener información.")
      .setRequired(false)
  );

async function execute(interaction) {
  const user = interaction.options.getUser("user") || interaction.user;
  await interaction.deferReply();

  let userProfile = await User.findOne({ _id: user.id });
  if (!userProfile) {
    userProfile = new User({
      _id: user.id,
      username: user.username,
      showdownNick: "anonimo",
      coins: 0,
      elo: 1000,
      winsLadder: 0,
      lossesLadder: 0,
      favoriteColor: null,
      companionPokemon: null,
      registered: false,
    });
    await userProfile.save();
  }

  const avatarURL = user.displayAvatarURL({ format: "png", dynamic: true });
  const users = await User.find().sort({ elo: -1, _id: 1 });
  const ranking = users.findIndex((u) => u.id === user.id) + 1;

  let embedColor;
  if (userProfile.favoriteColor === "red") {
    embedColor = 0xff0000;
  } else if (userProfile.favoriteColor === "blue") {
    embedColor = 0x0000ff;
  } else {
    embedColor = 0xffbf00;
  }

  const profileLink = `https://palette-dex.vercel.app/profile/${user.id}`;

  const exampleEmbed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`${user.globalName || user.username} (${user.username})`)
    .setAuthor({
      name: interaction.guild.name,
      iconURL: interaction.guild.iconURL(),
    })
    .setThumbnail(avatarURL)
    .addFields(
      {
        name: " ",
        value: `**🎯 Showdown:** ${userProfile.showdownNick || "N/A"}\n**💰 Pokécoins:** ${userProfile.coins || 0}\n**🦄 Compañero:** ${
          userProfile.companionPokemon ? userProfile.companionPokemon.name : "N/A"
        }\n**🎨 Color Favorito:** ${
          userProfile.favoriteColor
            ? userProfile.favoriteColor.charAt(0).toUpperCase() +
              userProfile.favoriteColor.slice(1)
            : "N/A"
        }`,
        inline: true,
      },
      { name: "\u200B", value: "\u200B" },
      {
        name: "Estadísticas de Ladder",
        value: `**⭐ Elo:** ${
          userProfile.elo.toString() || "N/A"
        }\n**👑 Rank:** #${ranking.toString() || "N/A"}\n**🚀 Combates:** ${
          (userProfile.winsLadder || 0) + (userProfile.lossesLadder || 0)
        } - **Wins:** ${userProfile.winsLadder || 0} - **Losses:** ${
          userProfile.lossesLadder || 0
        }\n**🎀 Efectividad:** ${
          (userProfile.winsLadder || 0) + (userProfile.lossesLadder || 0) === 0
            ? "0"
            : Math.round(
                ((userProfile.winsLadder || 0) /
                  ((userProfile.winsLadder || 0) +
                    (userProfile.lossesLadder || 0))) *
                  100
              )
        }%`,
        inline: true,
      },
      {
        name: "🔗 Perfil",
        value: `[Ver perfil completo](${profileLink})`,
        inline: false,
      }
    )
    .setTimestamp();

  await interaction.followUp({
    embeds: [exampleEmbed],
  });
}

export default { data, execute };