import { ChatInputCommandInteraction } from "discord.js";
import { DBConnection } from "../../DBConnection.js";
import { AutoRole } from "../../entity/AutoRole.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";

export enum EnableParam {
	role = "role"
}

export async function enable(interaction: ChatInputCommandInteraction<"cached">) {
	const role = interaction.options.getRole(EnableParam.role, true);

	if (role.id === interaction.guild.roles.everyone.id) {
		return interaction.reply({
			embeds: [{
				description: `Impossible d'assigner le rôle ${interaction.guild.roles.everyone} à qui que ce soit`,
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	if (!interaction.guild.members.me) {
		throw Error("guild.me is null, no idea why (has the bot been kicked?)");
	}

	const highestRole = interaction.guild.members.me.roles.highest;
	const roleBelowBot: boolean =
		interaction.guild.roles.comparePositions(
			role,
			highestRole
		) < 0;

	if (!roleBelowBot) {
		return interaction.reply({
			embeds:[{
				description: `Impossible d'assigner le role ${role} à qui que ce soit, car ce rôle est plus que ${highestRole} dans la hiérarchie (mon rôle le plus haut)\nIl faut que l'un de mes rôles soit plus haut que ${role} pour que je puisse l'assigner automatiquement`,
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	await DBConnection.getRepository(AutoRole).save(
		new AutoRole(interaction.guildId, role.id)
	);

	return interaction.reply({
		embeds: [{
			description: `Tous les nouveaux membres auront le rôle ${role} automatiquement`,
			color: EpsibotColor.success
		}],
		ephemeral: true
	});
}
