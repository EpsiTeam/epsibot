import { randomUUID } from "crypto";
import {
	ChatInputCommandInteraction,
	ComponentType,
	ModalComponentData,
	TextInputStyle
} from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { confirm } from "../../util/confirm/confirm.js";
import {
	deleteCommandFromName,
	getCommandFromName
} from "../../util/custom-command/db-query.js";
import { commandFields } from "./help.js";

enum ModalParams {
	name = "CustomCommandName",
	text = "CustomCommandText"
}

export async function addNormal(
	interaction: ChatInputCommandInteraction<"cached">,
	roleNeeded: string,
	autoDelete: boolean
) {
	const modalId = randomUUID();

	await interaction.showModal({
		customId: modalId,
		title: "Nouvelle commande custom",
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						customId: ModalParams.name,
						type: ComponentType.TextInput,
						label: "Nom de la commande",
						style: TextInputStyle.Short,
						required: true,
						maxLength: CustomCommand.maxNameLength
					}
				]
			},
			{
				type: ComponentType.ActionRow,
				components: [
					{
						customId: ModalParams.text,
						label: "Réponse de la commande",
						type: ComponentType.TextInput,
						style: TextInputStyle.Paragraph,
						required: true,
						maxLength: CustomCommand.maxResponseLength,
						placeholder:
							"Faire '/command help' pour voir comment rajouter des paramètres"
					}
				]
			}
		]
	} as ModalComponentData);

	const result = await interaction
		.awaitModalSubmit({
			filter: (modalInteraction) => {
				return (
					modalInteraction.customId === modalId &&
					modalInteraction.user.id === interaction.user.id
				);
			},
			time: 60 * 60_000 // 1h
		})
		.catch(() => null);

	if (result === null) {
		return;
	}
	await result.deferReply({ ephemeral: true });

	const name = result.fields.getTextInputValue(ModalParams.name);
	const text = result.fields.getTextInputValue(ModalParams.text);

	// Checking if command already exists
	const oldCommand = await getCommandFromName(interaction.guildId, name);

	if (oldCommand) {
		// Command already exists
		const { answer: replace } = await confirm(result, {
			description: `La commmande \`${name}\` existe déjà, faut il la remplacer ?`,
			color: EpsibotColor.warning
		});

		if (!replace) {
			return;
		} else {
			// Deleting old command
			await deleteCommandFromName(interaction.guildId, name);
		}
	}

	const command = await DBConnection.getRepository(CustomCommand).save(
		new CustomCommand(
			interaction.guildId,
			name,
			text,
			roleNeeded,
			autoDelete
		)
	);

	return result.followUp({
		embeds: [
			{
				title: `Commande \`${command.name}\` créée, elle répondra:`,
				description: command.response,
				fields: commandFields(command),
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}
