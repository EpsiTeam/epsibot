import { CommandInteraction, MessagePayload } from "discord.js";
import { getRepository, Repository } from "typeorm";
import { CustomCommand } from "../entity/CustomCommand.js";
import { Command } from "./Command.js";

export enum GuildCommandSubcommand {
	list = "list",
	add = "add",
	remove = "remove"
}

export class GuildCommand extends Command {
	constructor() {
		super("command", "Gère les commandes custom");

		this.needPermissions = ["ADMINISTRATOR"];

		this.options = [{
			type: "SUB_COMMAND",
			name: GuildCommandSubcommand.add,
			description: "Ajoute une commande custom",
			options: [{
				type: "STRING",
				name: "name",
				description: "Nom de la commande custom à ajouter, tout message qui commencera par ce nom appelera cette commande",
				required: true
			}, {
				type: "STRING",
				name: "response",
				description: "Réponse de la commande custom (\\n pour les retours à la ligne, et $0, $1 etc pour les paramètres)",
				required: true
			}, {
				type: "BOOLEAN",
				name: "admin_only",
				description: "Est-ce que seulement les admins pourront lancer cete commande custom ?",
				required: true
			}, {
				type: "BOOLEAN",
				name: "auto_delete",
				description: "Est-ce que le message qui active la commande doit être supprimé automatiquement ?",
				required: true
			}]
		}, {
			type: "SUB_COMMAND",
			name: GuildCommandSubcommand.remove,
			description: "Supprime une commande custom",
			options: [{
				type: "STRING",
				name: "name",
				description: "Nom de la commande custom à suprimer",
				required: true
			}]
		}, {
			type: "SUB_COMMAND",
			name: GuildCommandSubcommand.list,
			description: "List les commandes custom existantes"
		}];
	}

	async execute(interaction: CommandInteraction<"cached">): Promise<void> {
		const subcommand = interaction.options.getSubcommand();
		const customCommandRepo = getRepository(CustomCommand);

		if (subcommand === GuildCommandSubcommand.list) {
			return this.listCommands(
				interaction,
				customCommandRepo
			);
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
		case GuildCommandSubcommand.add:
			return this.addCommand(
				interaction,
				customCommandRepo
			);
		case GuildCommandSubcommand.remove:
			return this.removeCommand(
				interaction,
				customCommandRepo
			);
		}
	}

	async listCommands(
		interaction: CommandInteraction<"cached">,
		customCommandRepo: Repository<CustomCommand>
	): Promise<void> {
		const commands = await customCommandRepo.find();
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
						name: "Réponse:",
						value: commands[index].response
					}, {
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
				}],
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
			idle: 20000,
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

	async addCommand(
		interaction: CommandInteraction<"cached">,
		customCommandRepo: Repository<CustomCommand>
	): Promise<void> {
		const name = interaction.options.getString("name", true);
		const inlineResponse = interaction.options.getString("response", true);
		const adminOnly = interaction.options.getBoolean("admin_only", true);
		const autoDelete = interaction.options.getBoolean("auto_delete", true);

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
		await customCommandRepo.save(new CustomCommand(
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

	async removeCommand(
		interaction: CommandInteraction<"cached">,
		customCommandRepo: Repository<CustomCommand>
	): Promise<void> {
		const name = interaction.options.getString("name", true);

		const command = await customCommandRepo.findOne(new CustomCommand(
			interaction.guildId,
			name
		));

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

		await customCommandRepo.remove(command);

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
