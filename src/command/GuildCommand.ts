import { CommandInteraction } from "discord.js";
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
				type: "BOOLEAN",
				name: "admin_only",
				description: "Est-ce que seulement les admins pourront lancer cete commande custom ?",
				required: true
			}, {
				type: "STRING",
				name: "response",
				description: "Réponse de la commande custom (\\n pour les retours à la ligne, et $0, $1 etc pour les paramètres)",
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

	async execute(interaction: CommandInteraction<"cached">) {
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
	) {
		const commands = await customCommandRepo.find();

		const names = commands.map(command => "`" + command.name + "`").join("\n");

		// TODO implement better list
		return interaction.reply({
			embeds: [{
				title: "Liste des commandes custom",
				description: names,
				footer: {
					text: "Oui c'est pas très détaillé, ça le sera dans une future maj"
				}
			}]
		});
	}

	async addCommand(
		interaction: CommandInteraction<"cached">,
		customCommandRepo: Repository<CustomCommand>
	) {
		const name = interaction.options.getString("name", true);
		const inlineResponse = interaction.options.getString("response", true);
		const adminOnly = interaction.options.getBoolean("admin_only", true);

		const response = inlineResponse.replaceAll("\\n", "\n");

		// TODO ask for confirmation when command already exists
		await customCommandRepo.save(new CustomCommand(
			interaction.guildId,
			name,
			response,
			adminOnly
		));

		return interaction.reply({
			embeds: [{
				title: "Commande créée:",
				description: `Commande custom \`${name}\`:\n${response}`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	async removeCommand(
		interaction: CommandInteraction<"cached">,
		customCommandRepo: Repository<CustomCommand>
	) {
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
