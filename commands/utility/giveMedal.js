import User from "../../model/user.model.js";
import { SlashCommandBuilder } from 'discord.js';


const data = new SlashCommandBuilder()
    .setName('givemedal')
    .setDescription('Get information about a user!')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to get information about')
            .setRequired(true)

    )
    .addStringOption(option =>
        option.setName('medal')
            .setDescription('Choose a medal to give')
            .setRequired(true)
            .addChoices([
                { name: 'Fuego', value: 'medal1' },
                { name: 'Agua', value: 'medal2' },
                { name: 'Lucha', value: 'medal3' },
                { name: 'Volador', value: 'medal4' },
                { name: 'Hada', value: 'medal5' },
                { name: 'Siniestro', value: 'medal6' },
                { name: 'Planta', value: 'medal7' },
                { name: 'Eléctrico', value: 'medal8' },
            ])

    );

async function execute(interaction) {
    // Obtenemos el objeto User del parámetro 'user'
    const user = interaction.options.getUser('user');

    // Obtenemos el nombre de la medalla del parámetro 'medal'
    const medalName = interaction.options.getString('medal');

    // Damos la medalla al usuario
    const medalGiven = await giveMedal(user.id, user.username, medalName);

    // Respondemos a la interacción
    if (medalGiven) {
        await interaction.reply(`¡${user.username} ha obtenido la medalla ${medalName}!`);
    } else {
        await interaction.reply(`¡${user.username} ya tiene la medalla ${medalName}!`);
    }

}

async function giveMedal(userId, trainerName, medalName) {
    // Busca el perfil del usuario o crea uno nuevo si no existe
    const user = await User.findById(userId) || new User({ _id: userId, trainerName: trainerName });

    if (!user.medals.includes(medalName)) {
        // Agrega la medalla al perfil del usuario
        user.medals.push(medalName);

        // Guarda el perfil del usuario
        await user.save();

        // Devuelve true para indicar que la medalla fue agregada
        return true;
    }

    // Devuelve false para indicar que el usuario ya tenía la medalla
    return false;


}

export default { data, execute };