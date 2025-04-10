import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";

const data = new SlashCommandBuilder()
    .setName("clean-pokemon-collection")
    .setDescription("Limpia la colección de Pokémon de un usuario eliminando duplicados y entradas inválidas.")
    .addUserOption(option =>
        option.setName("usuario")
            .setDescription("El usuario cuya colección deseas limpiar.")
            .setRequired(true)
    );

async function execute(interaction) {
    const targetUser = interaction.options.getUser("usuario");

    const user = await User.findById(targetUser.id);

    if (!user) {
        await interaction.reply(`No se encontró al usuario ${targetUser.tag} en la base de datos.`);
        return;
    }

    if (!user.pokemonCollection || user.pokemonCollection.length === 0) {
        await interaction.reply(`La colección de Pokémon de ${targetUser.tag} ya está vacía.`);
        return;
    }

    // Filtrar y eliminar duplicados
    const validPokemon = user.pokemonCollection.filter(pokemon => pokemon.number); // Eliminar los que no tienen `number`
    const uniquePokemon = [];
    const seenNumbers = new Set();

    validPokemon.forEach(pokemon => {
        if (!seenNumbers.has(pokemon.number)) {
            uniquePokemon.push(pokemon); // Mantener solo la primera aparición
            seenNumbers.add(pokemon.number); // Registrar el número como visto
        }
    });

    // Actualizar la colección del usuario
    user.pokemonCollection = uniquePokemon;
    await user.save();

    await interaction.reply(`La colección de Pokémon de ${targetUser.tag} ha sido limpiada. Ahora tiene ${user.pokemonCollection.length} entradas únicas.`);
}

export default { data, execute: adminOnly(execute) };