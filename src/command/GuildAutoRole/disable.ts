import { CommandInteraction } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { AutoRole } from "../../database/entity/AutoRole.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";

export async function disable(interaction: CommandInteraction<"cached">) {
	const repo = DBConnection.getRepository(AutoRole);

	const autorole = await repo.findOneBy({
		guildId: interaction.guildId
	});

	if (!autorole) {
		return interaction.reply({
			embeds: [
				{
					description:
						"Il n'y avait pas de rôle automatique configuré",
					color: EpsibotColor.warning
				}
			],
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
		embeds: [
			{
				description: message,
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}
