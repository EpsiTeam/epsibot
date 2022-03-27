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
				title: "Commande non existente",
				description: `La commande custom \`${name}\` n'existe pas, du coup je sais pas trop comment la supprimer tu vois :/`,
				color: "RED"
			}],
			ephemeral: true
		});
	}

	await getRepository(CustomCommand).remove(command);

	return interaction.reply({
		embeds: [{
			title: "Commande supprimée",
			description: `La commande custom \`${name}\` a été supprimée`,
			color: "GREEN"
		}],
		ephemeral: true
	});
}
