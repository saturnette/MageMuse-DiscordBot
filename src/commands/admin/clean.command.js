import { SlashCommandBuilder } from "discord.js";
import User from "../../models/user.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";


const data = new SlashCommandBuilder()
    .setName("clean-pokemon-collection")
    .setDescription("Limpia la colección de Pokémon eliminando duplicados y entradas inválidas.");

async function execute(interaction) {
    const userId = interaction.user.id;

    const user = await User.findById(userId);

    if (!user) {
        await interaction.reply("No se encontró al usuario en la base de datos.");
        return;
    }

    if (!user.pokemonCollection || user.pokemonCollection.length === 0) {
        await interaction.reply("Tu colección de Pokémon ya está vacía.");
        return;
    }

    // Filtrar y consolidar la colección
    const validPokemon = user.pokemonCollection.filter(pokemon => pokemon.number); // Eliminar los que no tienen `number`
    const consolidatedPokemon = [];

    validPokemon.forEach(pokemon => {
        const existing = consolidatedPokemon.find(p => p.number === pokemon.number);
        if (existing) {
            existing.count += pokemon.count; // Consolidar duplicados sumando los `count`
        } else {
            consolidatedPokemon.push({ ...pokemon }); // Agregar Pokémon único
        }
    });

    // Actualizar la colección del usuario
    user.pokemonCollection = consolidatedPokemon;
    await user.save();

    await interaction.reply(`Tu colección de Pokémon ha sido limpiada. Ahora tienes ${user.pokemonCollection.length} entradas únicas.`);
}

export default { data, execute: adminOnly(execute) };