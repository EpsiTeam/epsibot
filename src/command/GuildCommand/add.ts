import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { CustomCommand } from "../../entity/CustomCommand.js";

export enum AddParam {
	name = "name",
	response = "response",
	adminOnly = "admin_only",
	autoDelete = "auto_delete"
}

export async function add(interaction: CommandInteraction<"cached">) {
	const name = interaction.options.getString(AddParam.name, true);
	const inlineResponse =
		interaction.options.getString(AddParam.response, true);
	const adminOnly =
		interaction.options.getBoolean(AddParam.adminOnly, true);
	const autoDelete =
		interaction.options.getBoolean(AddParam.autoDelete, true);

	const response = inlineResponse.replaceAll("\\n", "\n");

	if (
		response.length > CustomCommand.maxResponseLength ||
		name.length > CustomCommand.maxNameLength
	) {
		return interaction.reply({
			embeds: [{
				title: "Impossible d'ajouter cette commande custom",
				description: `Le nom de la commande doit faire moins de ${CustomCommand.maxNameLength} caractères, et la réponse de la commande doit faire moins de ${CustomCommand.maxResponseLength} caractères`,
				color: "RED"
			}],
			ephemeral: true
		});
	}

	// TODO ask for confirmation when command already exists
	await getRepository(CustomCommand).save(new CustomCommand(
		interaction.guildId,
		name,
		response,
		adminOnly,
		autoDelete
	));

	return interaction.reply({
		embeds: [{
			title: "Commande créée",
			description: `Commande \`${name}\`:\n${response}`,
			fields: [{
				name: "Réponse:",
				value: response
			}, {
				name: "Pour admins:",
				value: adminOnly ? "Oui" : "Non",
				inline: true
			}, {
				name: "Auto delete",
				value: autoDelete ? "Oui" : "Non",
				inline: true
			}],
			color: "GREEN"
		}],
		ephemeral: true
	});
}
