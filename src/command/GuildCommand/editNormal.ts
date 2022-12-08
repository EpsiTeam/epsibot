import { randomUUID } from "crypto";
import {
	ChatInputCommandInteraction,
	ComponentType,
	ModalComponentData,
	TextInputStyle
} from "discord.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import {
	deleteCommandFromName,
	getCommandFromName
} from "../../util/custom-command/db-query.js";
import { confirm } from "../../util/confirm/confirm.js";
import { DBConnection } from "../../database/DBConnection.js";
import { commandFields } from "./help.js";

enum ModalParams {
	name = "CustomCommandName",
	text = "CustomCommandText"
}

export async function editNormal(
	interaction: ChatInputCommandInteraction<"cached">,
	command: CustomCommand,
	adminOnly: boolean,
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
						maxLength: CustomCommand.maxNameLength,
						value: command.name
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
							"Faire '/command help' pour voir comment rajouter des paramètres",
						value: command.response
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

	if (name !== command.name) {
		const oldCommand = await getCommandFromName(interaction.guildId, name);
		if (oldCommand) {
			const { answer: replace } = await confirm(result, {
				description: `Renommage de \`${command.name}\` en \`${name}\` -> il y avait déjà une commande nommée \`${name}\`, faut il la remplacer ?`,
				color: EpsibotColor.warning
			});

			if (!replace) {
				return;
			}
		}
	}

	await deleteCommandFromName(interaction.guildId, command.name);
	if (name !== command.name) {
		await deleteCommandFromName(interaction.guildId, name);
	}

	const edited = await DBConnection.getRepository(CustomCommand).save(
		new CustomCommand(
			interaction.guildId,
			name,
			text,
			adminOnly,
			autoDelete
		)
	);

	return result.followUp({
		embeds: [
			{
				title: `Commande \`${edited.name}\` modifiée, elle répondra:`,
				description: edited.response,
				fields: commandFields(edited),
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}
