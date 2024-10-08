import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import Role from "../../models/role.model.js";
import { adminOnly } from "../../middlewares/rol.middleware.js";

const data = new SlashCommandBuilder()
  .setName("set-role")
  .setDescription("Configura el ID de un rol")
  .addStringOption((option) =>
    option
      .setName("roletype")
      .setDescription("El tipo de rol a configurar")
      .setRequired(true)
      .addChoices(
        { name: 'leader', value: 'leader' },
        { name: 'elite', value: 'elite' }
      )
  )
  .addRoleOption((option) =>
    option
      .setName("role")
      .setDescription("El rol a configurar")
      .setRequired(true)
  );

async function execute(interaction) {

  const roleType = interaction.options.getString("roletype");
  const role = interaction.options.getRole("role");

  const update = {};
  update[roleType] = role.id;

  await Role.findOneAndUpdate({}, update, { upsert: true });

  await interaction.reply(
    `El rol ${role.name} ha sido configurado como el rol ${roleType}.`
  );
}

export default { data, execute: adminOnly(execute) };