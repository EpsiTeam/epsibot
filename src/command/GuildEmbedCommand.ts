/* eslint-disable max-len */
import { Collection, ColorResolvable, CommandInteraction, Message, MessagePayload } from "discord.js";
import { getRepository } from "typeorm";
import { CustomEmbedCommand } from "../entity/CustomEmbedCommand.js";
import { Command } from "./manager/Command.js";

enum Subcommand {
	list = "list",
	add = "add",
	remove = "remove"
}

enum Params {
	name = "name",
	adminOnly = "admin_only",
	autoDelete = "auto_delete"
}

enum ButtonAction {
	yes = "yes",
	no = "no"
}

export class GuildEmbedCommand extends Command {
	constructor() {
		super("embed_command", "Gère les commandes embed custom");

		this.needPermissions = ["ADMINISTRATOR"];

		this.options = [{
			type: "SUB_COMMAND",
			name: Subcommand.list,
			description: "Liste les commandes embed custom existantes"
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.add,
			description: "Ajoute une commande embed custom",
			options: [{
				type: "STRING",
				name: Params.name,
				description: "Nom de la commande custom à ajouter, tout message qui commencera par ce nom appelera cette commande",
				required: true
			}, {
				type: "BOOLEAN",
				name: Params.adminOnly,
				description: "Est-ce que seulement les admins pourront lancer cete commande custom ?",
				required: true
			}, {
				type: "BOOLEAN",
				name: Params.autoDelete,
				description: "Est-ce que le message qui active la commande doit être supprimé automatiquement ?",
				required: true
			}]
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.remove,
			description: "Supprime une commande embed custom",
			options: [{
				type: "STRING",
				name: Params.name,
				description: "Nom de la commande custom à supprimer",
				required: true
			}]
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.list) {
			return this.listCommands(interaction);
		}

		if (!this.hasPermissions(interaction)) {
			return interaction.reply({
				embeds: [{
					title: "Il faut être un admin pour créer ou supprimer des commandes custom désolé !",
					color: "RED"
				}],
				ephemeral: true
			});
		}

		switch (subcommand) {
		case Subcommand.add:
			return this.addCommand(interaction);
		case Subcommand.remove:
			return this.removeCommand(interaction);
		}

		throw Error(`Unexpected subcommand ${subcommand}`);
	}

	async listCommands(interaction: CommandInteraction<"cached">) {
		const commands = await getRepository(CustomEmbedCommand).find();
		if (commands.length === 0) {
			return interaction.reply({
				embeds: [{
					title: "List des commandes custom",
					description: "Il n'y a aucune commande custom sur ce serveur :o",
					color: "RED"
				}]
			});
		}

		enum ButtonAction {
			previous = "previous",
			next = "next"
		}

		const message = await interaction.deferReply({
			fetchReply: true
		});

		let currentIndex = 0;

		const showList = (index: number) => {
			return new MessagePayload(interaction, {
				embeds: [{
					title: "Liste des commandes custom",
					description: `Commande \`${commands[index].name}\``,
					fields: [{
						name: "Pour admins:",
						value: commands[index].adminOnly ? "Oui" : "Non",
						inline: true
					}, {
						name: "Auto delete:",
						value: commands[index].autoDelete ? "Oui" : "Non",
						inline: true
					}],
					footer: {
						text: `Commande ${index + 1}/${commands.length}`
					}
				},
				commands[index].createEmbed()
				],
				components: [{
					type: "ACTION_ROW",
					components: [{
						type: "BUTTON",
						label: "<",
						style: "SECONDARY",
						customId: ButtonAction.previous,
						disabled: commands.length === 0
					}, {
						type: "BUTTON",
						label: ">",
						style: "SECONDARY",
						customId: ButtonAction.next,
						disabled: commands.length === 0
					}]
				}]
			});
		};

		const collector = message.createMessageComponentCollector({
			idle: 60 * 1000,
			componentType: "BUTTON"
		});

		collector.on("collect", async click => {
			if (click.customId === ButtonAction.next) {
				currentIndex++;
				if (currentIndex >= commands.length) currentIndex = 0;
			}
			if (click.customId === ButtonAction.previous) {
				currentIndex--;
				if (currentIndex < 0) currentIndex = commands.length - 1;
			}

			await click.update(showList(currentIndex));
		});

		collector.on("end", async () => {
			await interaction.editReply({
				components: []
			});
		});

		await interaction.editReply(showList(currentIndex));
	}

	async addCommand(interaction: CommandInteraction<"cached">) {
		const name = interaction.options.getString(Params.name, true);
		const adminOnly =
			interaction.options.getBoolean(Params.adminOnly, true);
		const autoDelete =
			interaction.options.getBoolean(Params.autoDelete, true);

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
				components: [{
					type: "ACTION_ROW",
					components: [{
						type: "SELECT_MENU",
						options: [
							{
								label: "Défaut",
								value: "DEFAULT"
							},
							{
								label: "Turquoise",
								value: "AQUA"
							},
							{
								label: "Turquoise foncé",
								value: "DARK_AQUA"
							},
							{
								label: "Vert",
								value: "GREEN"
							},
							{
								label: "Vert foncé",
								value: "DARK_GREEN"
							},
							{
								label: "Bleu",
								value: "BLUE"
							},
							{
								label: "Bleu foncé",
								value: "DARK_BLUE"
							},
							{
								label: "Violet",
								value: "DARK_PURPLE"
							},
							{
								label: "Fushia",
								value: "LUMINOUS_VIVID_PINK"
							},
							{
								label: "Fushia foncé",
								value: "DARK_VIVID_PINK"
							},
							{
								label: "Or",
								value: "GOLD"
							},
							{
								label: "Or foncé",
								value: "DARK_GOLD"
							},
							{
								label: "Orange",
								value: "ORANGE"
							},
							{
								label: "Orange foncé",
								value: "DARK_ORANGE"
							},
							{
								label: "Rouge",
								value: "RED"
							},
							{
								label: "Rouge foncé",
								value: "DARK_RED"
							},
							{
								label: "Gris",
								value: "GREY"
							},
							{
								label: "Gris foncé",
								value: "DARK_GREY"
							},
							{
								label: "Gris très foncé",
								value: "DARKER_GREY"
							},
							{
								label: "Gris clair",
								value: "LIGHT_GREY"
							},
							{
								label: "Bleu marine",
								value: "NAVY"
							},
							{
								label: "Bleu marine foncé",
								value: "DARK_NAVY"
							},
							{
								label: "Jaune",
								value: "YELLOW"
							}
						],
						minValues: 1,
						maxValues: 1,
						customId: "selectColor"
					}]
				}]
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
							placeholder: color as string,
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

	async removeCommand(interaction: CommandInteraction<"cached">) {
		const name = interaction.options.getString(Params.name, true);

		const command = await getRepository(CustomEmbedCommand).findOne(
			new CustomEmbedCommand(
				interaction.guildId,
				name
			));

		if (!command) {
			return interaction.reply({
				embeds: [{
					title: "Commande non existente",
					description: `La commande custom \`${name}\` n'existe pas`,
					color: "RED"
				}],
				ephemeral: true
			});
		}

		await getRepository(CustomEmbedCommand).remove(command);

		return interaction.reply({
			embeds: [{
				title: "Commande supprimée",
				description: `La commande custom \`${name}\` a été supprimée`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}
}
