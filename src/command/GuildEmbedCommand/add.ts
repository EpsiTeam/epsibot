import { CommandInteraction, Collection, Message, ColorResolvable } from "discord.js";
import { getRepository } from "typeorm";
import { CustomEmbedCommand } from "../../entity/CustomEmbedCommand.js";
import { actionRowColor } from "../../utils/color/select-menu-color.js";

export enum AddParam {
	name = "name",
	adminOnly = "admin_only",
	autoDelete = "auto_delete"
}

enum ButtonAction {
	yes = "yes",
	no = "no"
}

export async function add(interaction: CommandInteraction<"cached">) {
	const name = interaction.options.getString(AddParam.name, true);
	const adminOnly =
		interaction.options.getBoolean(AddParam.adminOnly, true);
	const autoDelete =
		interaction.options.getBoolean(AddParam.autoDelete, true);

	if (!interaction.channel) {
		throw Error("Channel doesn't exist");
	}

	await interaction.reply({
		embeds: [{
			description: `Quel sera le titre affiché pour la commande ${name} ?`,
			color: "AQUA"
		}]
	});

	let response: Collection<string, Message<boolean>>;

	try {
		response = await interaction.channel.awaitMessages({
			filter: (msg) => msg.author.id === interaction.member.id,
			max: 1,
			time: 60_000,
			errors: ["time"]
		});
	} catch (err) {
		return interaction.followUp({
			embeds: [{
				description: `Création de la commande ${name} annulée, il fallait répondre !`,
				color: "RED"
			}]
		});
	}

	const msgTitle = response.first() as Message;
	const title = msgTitle.content;
	if (
		title.length == 0 ||
		title.length > CustomEmbedCommand.maxTitleLength
	) {
		await msgTitle.react("❌");
		return msgTitle.reply({
			embeds: [{
				title: `Création de la commande ${name} annulée`,
				description: `Le titre choisi a une taille de ${title.length}, la taille doit être entre 1 et ${CustomEmbedCommand.maxTitleLength} caractères`,
				color: "RED"
			}]
		});
	}

	await msgTitle.react("✅");

	await interaction.followUp({
		embeds: [{
			description: `Quel sera la description affichée pour la commande ${name} ?`,
			color: "AQUA"
		}]
	});

	try {
		response = await interaction.channel.awaitMessages({
			filter: (msg) => msg.author.id === interaction.member.id,
			max: 1,
			time: 60_000,
			errors: ["time"]
		});
	} catch (err) {
		return interaction.followUp({
			embeds: [{
				description: `Création de la commande ${name} annulée, il fallait répondre !`,
				color: "RED"
			}]
		});
	}

	const msgDescription = response.first() as Message;
	const description = msgDescription.content;
	if (
		description.length == 0 ||
		description.length > CustomEmbedCommand.maxDescriptionLength
	) {
		await msgDescription.react("❌");
		return msgDescription.reply({
			embeds: [{
				title: `Création de la commande ${name} annulée`,
				description: `La description choisie a une taille de ${description.length}, la taille doit être entre 1 et ${CustomEmbedCommand.maxDescriptionLength} caractères`,
				color: "RED"
			}]
		});
	}

	await msgDescription.react("✅");

	const msgAskImage = await interaction.followUp({
		embeds: [{
			description: `Est-ce que la commande ${name} contient une image ?`,
			color: "AQUA"
		}],
		components: [{
			type: "ACTION_ROW",
			components: [{
				type: "BUTTON",
				label: "Oui",
				style: "SUCCESS",
				customId: ButtonAction.yes
			}, {
				type: "BUTTON",
				label: "Non",
				style: "DANGER",
				customId: ButtonAction.no
			}]
		}]
	});

	let hasImage: boolean;
	try {
		const buttonResponse = await msgAskImage.awaitMessageComponent({
			filter: (click) => click.member.id === interaction.member.id,
			time: 60_000,
			componentType: "BUTTON"
		});
		hasImage = buttonResponse.component.customId === ButtonAction.yes;

		await buttonResponse.update({
			components: [{
				type: "ACTION_ROW",
				components: [{
					type: "BUTTON",
					label: hasImage ? "Oui" : "Non",
					style: hasImage ? "SUCCESS" : "DANGER",
					customId: hasImage ? ButtonAction.yes : ButtonAction.no,
					disabled: true
				}]
			}]
		});
	} catch (err) {
		return interaction.followUp({
			embeds: [{
				description: `Création de la commande ${name} annulée, il fallait choisir une option !`,
				color: "RED"
			}]
		});
	}

	let image = "";
	if (hasImage) {
		await interaction.followUp({
			embeds: [{
				description: `Quelle sera l'image affichée pour la commande ${name} ?`,
				color: "AQUA"
			}]
		});

		try {
			response = await interaction.channel.awaitMessages({
				filter: (msg) => msg.author.id === interaction.member.id,
				max: 1,
				time: 60_000,
				errors: ["time"]
			});
		} catch (err) {
			return interaction.followUp({
				embeds: [{
					description: `Création de la commande ${name} annulée, il fallait répondre !`,
					color: "RED"
				}]
			});
		}

		const msgImage = response.first() as Message;
		const attachment = msgImage.attachments.first();
		if (!attachment || !attachment.contentType || !attachment.contentType.startsWith("image")) {
			await msgTitle.react("❌");
			return msgDescription.reply({
				embeds: [{
					title: `Création de la commande ${name} annulée`,
					description: "Une image était attendue",
					color: "RED"
				}]
			});
		}

		image = attachment.url;
		await msgTitle.react("✅");
	}

	const msgAskColor = await interaction.followUp({
		embeds: [{
			description: `Est-ce que la commande ${name} doit avoir une couleur spécifique ?`,
			color: "AQUA"
		}],
		components: [{
			type: "ACTION_ROW",
			components: [{
				type: "BUTTON",
				label: "Oui",
				style: "SUCCESS",
				customId: ButtonAction.yes
			}, {
				type: "BUTTON",
				label: "Non",
				style: "DANGER",
				customId: ButtonAction.no
			}]
		}]
	});

	let hasColor: boolean;
	try {
		const buttonResponse = await msgAskColor.awaitMessageComponent({
			filter: (click) => click.member.id === interaction.member.id,
			time: 60_000,
			componentType: "BUTTON"
		});
		hasColor = buttonResponse.component.customId === ButtonAction.yes;

		await buttonResponse.update({
			components: [{
				type: "ACTION_ROW",
				components: [{
					type: "BUTTON",
					label: hasColor ? "Oui" : "Non",
					style: hasColor ? "SUCCESS" : "DANGER",
					customId: hasColor ? ButtonAction.yes : ButtonAction.no,
					disabled: true
				}]
			}]
		});
	} catch (err) {
		return interaction.followUp({
			embeds: [{
				description: `Création de la commande ${name} annulée, il fallait choisir une option !`,
				color: "RED"
			}]
		});
	}

	let color: ColorResolvable = "DEFAULT";
	if (hasColor) {
		const msgColor = await interaction.followUp({
			embeds: [{
				description: `Choisissez la couleur pour la commande ${name}`,
				color: "AQUA"
			}],
			components: [actionRowColor]
		});

		try {
			const selectResponse = await msgColor.awaitMessageComponent({
				filter: (click) => click.member.id === interaction.member.id,
				time: 60_000,
				componentType: "SELECT_MENU"
			});
			const colorOption = selectResponse.values;
			color = colorOption[0] as ColorResolvable;

			await selectResponse.update({
				components: [{
					type: "ACTION_ROW",
					components: [{
						type: "SELECT_MENU",
						placeholder: colorOption[0],
						options: [{
							label: "a",
							value: "a"
						}],
						customId: "selectColor",
						disabled: true
					}]
				}]
			});
		} catch (err) {
			return interaction.followUp({
				embeds: [{
					description: `Création de la commande ${name} annulée, il fallait valider une couleur !`,
					color: "RED"
				}]
			});
		}
	}

	// TODO ask for confirmation when command already exists
	const embedCommand = await getRepository(CustomEmbedCommand).save(
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

	return interaction.followUp({
		embeds: [{
			title: "Commande embed créée",
			description: `Commande \`${name}\``,
			fields: [{
				name: "Pour admins:",
				value: adminOnly ? "Oui" : "Non",
				inline: true
			}, {
				name: "Auto delete",
				value: autoDelete ? "Oui" : "Non",
				inline: true
			}],
			color: "GREEN"
		},
		embedCommand.createEmbed()
		]
	});
}
