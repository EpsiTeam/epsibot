import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { CustomEmbedCommand } from "../../entity/CustomEmbedCommand.js";

export enum RemoveParam {
	name = "name"
}

export async function remove(interaction: CommandInteraction<"cached">) {
	const name = interaction.options.getString(RemoveParam.name, true);

	const command = await getRepository(CustomEmbedCommand).findOne(
		new CustomEmbedCommand(
			interaction.guildId,
			name
		));

	if (!command) {
		return interaction.reply({
			embeds: [{
				title: "Commande non existente",
				description: `La commande custom \`${name}\` n'existe pas`,
				color: "RED"
			}],
			ephemeral: true
		});
	}

	await getRepository(CustomEmbedCommand).remove(command);

	return interaction.reply({
		embeds: [{
			title: "Commande supprimée",
			description: `La commande custom \`${name}\` a été supprimée`,
			color: "GREEN"
		}],
		ephemeral: true
	});
}
