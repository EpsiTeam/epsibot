import { randomUUID } from "crypto";
import {
	ChatInputCommandInteraction,
	ComponentType,
	ModalComponentData,
	resolveColor,
	TextInputStyle
} from "discord.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import {
	deleteCommandFromName,
	getCommandFromName
} from "../../util/custom-command/db-query.js";
import { isValidImageUrl } from "../../util/custom-command/url.js";
import { confirm } from "../../util/confirm/confirm.js";
import {
	getLabelFromColorValue,
	SelectMenuColor
} from "../../util/color/SelectMenuColor.js";
import { commandFields, timeoutEmbed } from "./help.js";
import { DBConnection } from "../../database/DBConnection.js";

enum ModalParams {
	name = "CustomCommandName",
	title = "CustomCommandTitle",
	description = "CustomCommandDescription",
	image = "CustomCommandImage"
}

export async function editEmbed(
	interaction: ChatInputCommandInteraction<"cached">,
	command: CustomEmbedCommand,
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
						maxLength: CustomEmbedCommand.maxNameLength,
						value: command.name
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
						placeholder: "Voir '/command help'",
						value: command.title
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
							"Faire '/command help' pour voir comment rajouter des paramètres",
						value: command.description
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
							"Laisser vide pour ne pas avoir d'image dans l'embed",
						value: command.image
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

	const { answer: changeColor } = await confirm(result, {
		description: `Faut-il changer la couleur de la commande \`${name}\` ?`,
		color: EpsibotColor.question
	});

	let color = command.color;
	if (changeColor) {
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

		color = resolveColor(Number(selectResponse.values[0]));
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
	}

	await deleteCommandFromName(interaction.guildId, command.name);
	if (name !== command.name) {
		await deleteCommandFromName(interaction.guildId, name);
	}

	const edited = await DBConnection.getRepository(CustomEmbedCommand).save(
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
				title: `Commande embed \`${edited.name}\` créée`,
				fields: commandFields(edited),
				footer: {
					text: "Réponse de la commande:"
				},
				color: EpsibotColor.success as number
			},
			edited.createEmbed()
		],
		ephemeral: true
	});
}
