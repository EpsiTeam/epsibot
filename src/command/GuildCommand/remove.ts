import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { CustomCommand } from "../../entity/CustomCommand.js";

export enum RemoveParam {
	name = "name"
}

export async function remove(interaction: CommandInteraction<"cached">) {
	const name = interaction.options.getString(RemoveParam.name, true);

	const command = await getRepository(CustomCommand).findOne(
		new CustomCommand(
			interaction.guildId,
			name
		)
	);

	if (!command) {
		return interaction.reply({
			embeds: [{
				description: `Commande custom \`${name}\` inexistente, impossible de la supprimer`,
				color: "RED"
			}],
			ephemeral: true
		});
	}

	await getRepository(CustomCommand).remove(command);

	return interaction.reply({
		embeds: [{
			description: `Commande custom \`${name}\` supprimée`,
			color: "GREEN"
		}],
		ephemeral: true
	});
}
