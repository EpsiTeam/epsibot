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
				description: "Il n'y avait pas de rôle automatique, mais bon si ça te fait plaisir, il n'y en a toujours pas !",
				color: "YELLOW"
			}],
			ephemeral: true
		});
	}

	await repo.remove(autorole);
	const role = await interaction.guild.roles.fetch(autorole.roleId);

	let message: string;

	if (!role) {
		message = "Les nouveaux membres n'auront plus de rôle automatique (tant mieux parce que j'ai l'impression que ce rôle n'existe plus)";
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
