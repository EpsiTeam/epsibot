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
				description: `Commande custom \`${name}\` inexistente, impossible de la supprimer`,
				color: "RED"
			}],
			ephemeral: true
		});
	}

	await getRepository(CustomEmbedCommand).remove(command);

	return interaction.reply({
		embeds: [{
			description: `Commande custom \`${name}\` supprimée`,
			color: "GREEN"
		}],
		ephemeral: true
	});
}
