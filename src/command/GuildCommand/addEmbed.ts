import {
	CommandInteraction,
	Collection,
	Message,
	ColorResolvable,
	AwaitMessagesOptions,
	ComponentType
} from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { SelectMenuColor } from "../../util/color/SelectMenuColor.js";
import { confirm } from "../../util/confirm/confirm.js";
import { timeoutEmbed, helpArgument, commandFields } from "./helper.js";

export async function addEmbed(
	interaction: CommandInteraction<"cached">,
	name: string,
	adminOnly: boolean,
	autoDelete: boolean
) {
	if (!interaction.channel) {
		throw new Error("Channel doesn't exist");
	}

	const collectorOption: AwaitMessagesOptions = {
		filter: (msg) => msg.author.id === interaction.member.id,
		max: 1,
		time: 60_000,
		errors: ["time"]
	};

	await interaction.followUp({
		embeds: [
			{
				description: `Quel sera le **titre** affiché pour la commande \`${name}\` ?`,
				color: EpsibotColor.question
			}
		]
	});

	let answer: Collection<string, Message<boolean>>;

	try {
		answer = await interaction.channel.awaitMessages(collectorOption);
	} catch (err) {
		return interaction.followUp(timeoutEmbed(name));
	}

	const msgTitle = answer.first();
	if (!msgTitle) {
		throw new Error("Collector returned with empty collection");
	}
	const title = msgTitle.content;
	if (title.length == 0 || title.length > CustomEmbedCommand.maxTitleLength) {
		await msgTitle.react("❌");
		return interaction.followUp({
			embeds: [
				{
					title: `Création de la commande \`${name}\` annulée`,
					description: `Le titre choisi a une taille de ${title.length}, la taille doit être entre 1 et ${CustomEmbedCommand.maxTitleLength} caractères`,
					color: EpsibotColor.error
				}
			]
		});
	}
	await msgTitle.react("✅");

	await interaction.followUp({
		embeds: [
			{
				description: `Quel sera la **description** affichée pour la commande \`${name}\` ?${helpArgument}`,
				color: EpsibotColor.question
			}
		],
		ephemeral: false
	});

	try {
		answer = await interaction.channel.awaitMessages(collectorOption);
	} catch (err) {
		return interaction.followUp(timeoutEmbed(name));
	}

	const msgDescription = answer.first();
	if (!msgDescription) {
		throw new Error("Collector returned with empty collection");
	}
	const description = msgDescription.content;
	if (
		description.length == 0 ||
		description.length > CustomEmbedCommand.maxDescriptionLength
	) {
		await msgDescription.react("❌");
		return interaction.followUp({
			embeds: [
				{
					title: `Création de la commande \`${name}\` annulée`,
					description: `La description choisie a une taille de ${description.length}, la taille doit être entre 1 et ${CustomEmbedCommand.maxDescriptionLength} caractères`,
					color: EpsibotColor.error
				}
			],
			ephemeral: false
		});
	}
	await msgDescription.react("✅");

	const hasImage = await confirm(interaction, {
		description: `Est-ce que la commande \`${name}\` doit contenir une image ?`,
		ephemeral: false
	});

	if (hasImage === null) {
		return interaction.followUp(timeoutEmbed(name));
	}

	let image = "";
	if (hasImage) {
		await interaction.followUp({
			embeds: [
				{
					description: `Quelle sera l'image affichée pour la commande \`${name}\` ?`,
					color: EpsibotColor.question
				}
			],
			ephemeral: false
		});

		try {
			answer = await interaction.channel.awaitMessages(collectorOption);
		} catch (err) {
			return interaction.followUp(timeoutEmbed(name));
		}

		const msgImage = answer.first();
		if (!msgImage) {
			throw new Error("Collector returned with empty collection");
		}
		const attachment = msgImage.attachments.first();
		if (
			!attachment ||
			!attachment.contentType ||
			!attachment.contentType.startsWith("image")
		) {
			await msgImage.react("❌");
			return interaction.followUp({
				embeds: [
					{
						description: `Création de la commande \`${name}\` annulée, une image était attendue`,
						color: EpsibotColor.error
					}
				],
				ephemeral: false
			});
		}

		image = attachment.url;
		await msgImage.react("✅");
	}

	const hasColor = await confirm(interaction, {
		description: `Est-ce que la commande \`${name}\` doit avoir une couleur spécifique ?`,
		ephemeral: false
	});

	if (hasColor === null) {
		return interaction.followUp(timeoutEmbed(name));
	}

	let color: ColorResolvable = EpsibotColor.default;
	if (hasColor) {
		const msgColor = await interaction.followUp({
			embeds: [
				{
					description: `Choisissez la couleur pour la commande \`${name}\``,
					color: EpsibotColor.question
				}
			],
			components: [SelectMenuColor.actionRow],
			ephemeral: false
		});

		try {
			const selectResponse = await msgColor.awaitMessageComponent({
				filter: (click) => click.user.id === interaction.member.id,
				time: 60_000,
				componentType: ComponentType.SelectMenu
			});
			const colorOption = selectResponse.values;
			color = colorOption[0] as ColorResolvable;

			await selectResponse.update({
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.SelectMenu,
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
			return interaction.followUp(timeoutEmbed(name));
		}
	}

	const [command] = await Promise.all([
		DBConnection.getRepository(CustomEmbedCommand).save(
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
		),
		DBConnection.getRepository(CustomCommand).delete({
			guildId: interaction.guildId,
			name
		})
	]);

	return interaction.followUp({
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
		ephemeral: false
	});
}
