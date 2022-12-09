import { randomUUID } from "crypto";
import {
	ComponentType,
	ChatInputCommandInteraction,
	ModalComponentData,
	TextInputStyle,
	resolveColor
} from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import {
	getLabelFromColorValue,
	SelectMenuColor
} from "../../util/color/SelectMenuColor.js";
import { confirm } from "../../util/confirm/confirm.js";
import {
	deleteCommandFromName,
	getCommandFromName
} from "../../util/custom-command/db-query.js";
import { isValidImageUrl } from "../../util/custom-command/url.js";
import { timeoutEmbed, commandFields } from "./help.js";

enum ModalParams {
	name = "CustomCommandName",
	title = "CustomCommandTitle",
	description = "CustomCommandDescription",
	image = "CustomCommandImage"
}

export async function addEmbed(
	interaction: ChatInputCommandInteraction<"cached">,
	roleNeeded: string,
	autoDelete: boolean
) {
	const modalId = randomUUID();

	await interaction.showModal({
		customId: modalId,
		title: "Nouvelle commande custom embed",
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						customId: ModalParams.name,
						type: ComponentType.TextInput,
						label: "Nom de la commande embed",
						style: TextInputStyle.Short,
						required: true,
						maxLength: CustomEmbedCommand.maxNameLength
					}
				]
			},
			{
				type: ComponentType.ActionRow,
				components: [
					{
						customId: ModalParams.title,
						type: ComponentType.TextInput,
						label: "Titre de l'embed'",
						style: TextInputStyle.Short,
						required: true,
						maxLength: CustomEmbedCommand.maxNameLength,
						placeholder: "Voir '/command help'"
					}
				]
			},
			{
				type: ComponentType.ActionRow,
				components: [
					{
						customId: ModalParams.description,
						label: "Description de l'embed'",
						type: ComponentType.TextInput,
						style: TextInputStyle.Paragraph,
						required: true,
						maxLength: CustomEmbedCommand.maxDescriptionLength,
						placeholder:
							"Faire '/command help' pour voir comment rajouter des paramètres"
					}
				]
			},
			{
				type: ComponentType.ActionRow,
				components: [
					{
						customId: ModalParams.image,
						label: "URL de l'image de l'embed",
						type: ComponentType.TextInput,
						style: TextInputStyle.Short,
						required: false,
						placeholder:
							"Laisser vide pour ne pas avoir d'image dans l'embed"
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
	const title = result.fields.getTextInputValue(ModalParams.title);
	const description = result.fields.getTextInputValue(
		ModalParams.description
	);
	const image = result.fields.getTextInputValue(ModalParams.image);

	if (image !== "" && !isValidImageUrl(image)) {
		return result.followUp({
			embeds: [
				{
					description: `\`${image}\` n'est pas une URL valide`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

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

	const msgColor = await result.followUp({
		embeds: [
			{
				description: `Choisissez la couleur pour la commande \`${name}\``,
				color: EpsibotColor.question
			}
		],
		components: [SelectMenuColor.actionRow],
		ephemeral: true
	});

	const selectResponse = await msgColor
		.awaitMessageComponent({
			filter: (click) => click.user.id === interaction.user.id,
			time: 60_000,
			componentType: ComponentType.StringSelect
		})
		.catch(async () => {
			return null;
		});

	if (selectResponse === null) {
		return result.followUp(timeoutEmbed(name));
	}

	const color = resolveColor(Number(selectResponse.values[0]));
	const label = getLabelFromColorValue(color);

	await selectResponse
		.update({
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.StringSelect,
							placeholder: label,
							options: [
								{
									label,
									value: String(color)
								}
							],
							customId: "selectColor",
							disabled: true
						}
					]
				}
			]
		})
		.catch(() => undefined);

	const command = await DBConnection.getRepository(CustomEmbedCommand).save(
		new CustomEmbedCommand(
			interaction.guildId,
			name,
			title,
			description,
			image,
			color,
			roleNeeded,
			autoDelete
		)
	);

	return result.followUp({
		embeds: [
			{
				title: `Commande embed \`${command.name}\` créée`,
				fields: commandFields(command),
				footer: {
					text: "Réponse de la commande:"
				},
				color: EpsibotColor.success as number
			},
			command.createEmbed()
		],
		ephemeral: true
	});
}
