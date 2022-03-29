import { ColorResolvable, CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { AutoRole } from "../../entity/AutoRole.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";

export async function info(interaction: CommandInteraction<"cached">) {
	const autorole = await getRepository(AutoRole).findOne(
		new AutoRole(interaction.guildId)
	);

	let message: string;
	let color: ColorResolvable;
	if (!autorole) {
		message = "Aucun rôle automatique n'est configuré";
		color = EpsibotColor.warning;
	} else {
		const role = await interaction.guild.roles.fetch(autorole.roleId);
		if (!role) {
			message = "Il semblerait que le rôle qui devait être automatiquement assigné n'existe plus";
			color = EpsibotColor.error;
		} else {
			message = `Les nouveaux membres auront automatiquement le rôle ${role}`;
			color = EpsibotColor.success;
		}
	}

	return interaction.reply({
		embeds: [{
			description: message,
			color: color
		}],
		ephemeral: true
	});
}
