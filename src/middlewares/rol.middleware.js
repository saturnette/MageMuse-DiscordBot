import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import { PermissionsBitField } from "discord.js";

async function sendErrorMessage(interaction, message) {
  await interaction.reply(message);
}

export function adminOnly(commandExecute) {
  return async function (interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await sendErrorMessage(interaction, "Necesitas permisos de administrador para ejecutar este comando.");
      return;
    }
    await commandExecute(interaction);
  };
}

export function eliteRoleOnly(commandExecute) {
  return async function (interaction) {
    await checkRole(interaction, "elite", "alto mando", commandExecute);
  };
}

export function leaderRoleOnly(commandExecute) {
  return async function (interaction) {
    await checkRole(interaction, "leader", "líder de gimnasio", commandExecute);
  };
}

async function checkRole(interaction, roleType, roleName, commandExecute) {
    const roleData = await Role.findOne({});
    const roleId = roleData?.[roleType];
  
    if (!interaction.member.roles.cache.has(roleId)) {
      await sendErrorMessage(interaction, `Necesitas permisos de ${roleName} para ejecutar este comando.`);
      return;
    }
  
    if (roleType === "leader") {
      const leaderProfile = await User.findById(interaction.user.id);
      if (!leaderProfile) {
        throw new Error("¿Un líder de gimnasio sin medalla? 🤔");
      }
    }
  
    await commandExecute(interaction);
  }