import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { AutoRole } from "../../entity/AutoRole.js";

export async function disable(interaction: CommandInteraction<"cached">) {
	const repo = getRepository(AutoRole);

	const autorole = await repo.findOne(
		new AutoRole(interaction.guildId)
	);

	if (!autorole) {
		return interaction.reply({
			embeds: [{
				title: "Rôle automatique supprimé",
				description: "Il n'y avait pas de rôle automatique configuré",
				color: "YELLOW"
			}],
			ephemeral: true
		});
	}

	await repo.remove(autorole);
	const role = await interaction.guild.roles.fetch(autorole.roleId);

	let message: string;

	if (!role) {
		message = "Les nouveaux membres n'auront plus de rôle automatique";
	} else {
		message = `Les nouveaux membres n'auront plus le rôle ${role} automatiquement`;
	}

	return interaction.reply({
		embeds: [{
			title: "Rôle automatique supprimé",
			description: message,
			color: "GREEN"
		}],
		ephemeral: true
	});
}
