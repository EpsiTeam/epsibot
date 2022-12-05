import {
	ColorResolvable,
	ComponentType,
	ChatInputCommandInteraction,
	ModalComponentData,
	TextInputStyle
} from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { SelectMenuColor } from "../../util/color/SelectMenuColor.js";
import { confirm } from "../../util/confirm/confirm.js";
import { isValidImageUrl } from "../../util/custom-command/url.js";
import { timeoutEmbed, commandFields } from "./help.js";

enum ModalParams {
	id = "ModalAddCustomEmbedCommand",
	name = "CustomCommandName",
	title = "CustomCommandTitle",
	description = "CustomCommandDescription",
	image = "CustomCommandImage"
}

export async function addEmbed(
	interaction: ChatInputCommandInteraction<"cached">,
	adminOnly: boolean,
	autoDelete: boolean
) {
	await interaction.showModal({
		customId: ModalParams.id,
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
					modalInteraction.customId === ModalParams.id &&
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

	if (!isValidImageUrl(image)) {
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
	const [oldCommand, oldEmbedCommand] = await Promise.all([
		DBConnection.getRepository(CustomCommand).findOneBy({
			guildId: interaction.guildId,
			name
		}),
		DBConnection.getRepository(CustomEmbedCommand).findOneBy({
			guildId: interaction.guildId,
			name
		})
	]);

	if (oldCommand || oldEmbedCommand) {
		// Command already exists
		const { answer: replace } = await confirm(result, {
			description: `La commmande \`${name}\` existe déjà, faut il la remplacer ?`,
			color: EpsibotColor.warning
		});

		if (!replace) {
			return;
		} else {
			// Deleting old command
			await Promise.all([
				DBConnection.getRepository(CustomCommand).delete({
					name,
					guildId: interaction.guildId
				}),
				DBConnection.getRepository(CustomEmbedCommand).delete({
					name,
					guildId: interaction.guildId
				})
			]);
		}
	}

	const { answer: hasColor } = await confirm(result, {
		description: `Est-ce que la commande \`${name}\` doit avoir une couleur spécifique ?`,
		ephemeral: true
	});

	if (hasColor === undefined) {
		return result.followUp(timeoutEmbed(name));
	}

	let color: ColorResolvable = EpsibotColor.default;
	if (hasColor) {
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

		try {
			const selectResponse = await msgColor.awaitMessageComponent({
				filter: (click) => click.user.id === interaction.user.id,
				time: 60_000,
				componentType: ComponentType.StringSelect
			});
			const colorOption = selectResponse.values;
			color = colorOption[0] as ColorResolvable;

			await selectResponse.update({
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.StringSelect,
								placeholder: colorOption[0],
								options: [
									{
										label: "Ceci ne devrait pas être visible",
										value: "Shouldn't be visible"
									}
								],
								customId: "selectColor",
								disabled: true
							}
						]
					}
				]
			});
		} catch (err) {
			return result.followUp(timeoutEmbed(name));
		}
	}

	const command = await DBConnection.getRepository(CustomEmbedCommand).save(
		new CustomEmbedCommand(
			interaction.guildId,
			name,
			title,
			description,
			image,
			color,
			adminOnly,
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
				color: EpsibotColor.success
			},
			command.createEmbed()
		],
		ephemeral: true
	});
}
