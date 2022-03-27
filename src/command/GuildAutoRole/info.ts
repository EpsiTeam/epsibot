import { ColorResolvable, CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { AutoRole } from "../../entity/AutoRole.js";

export async function info(interaction: CommandInteraction<"cached">) {
	const autorole = await getRepository(AutoRole).findOne(
		new AutoRole(interaction.guildId)
	);

	let message: string;
	let color: ColorResolvable;
	if (!autorole) {
		message = "Aucun rôle automatique n'est configuré";
		color = "YELLOW";
	} else {
		const role = await interaction.guild.roles.fetch(autorole.roleId);
		if (!role) {
			message = "Il semblerait que le rôle qui devait être automatiquement assigné n'existe plus";
			color = "RED";
		} else {
			message = `Les nouveaux membres auront automatiquement le rôle ${role}`;
			color = "GREEN";
		}
	}

	return interaction.reply({
		embeds: [{
			title: "Configuration du rôle automatique",
			description: message,
			color: color
		}],
		ephemeral: true
	});
}
