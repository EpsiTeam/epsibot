import { CommandInteraction } from "discord.js";
import { Command } from "../Command.js";
import { add } from "./add.js";
import { list } from "./list.js";
import { remove } from "./remove.js";

enum Subcommand {
	list = "list",
	add = "add",
	remove = "remove"
}

enum Param {
	name = "name",
	response = "response",
	adminOnly = "admin_only",
	autoDelete = "auto_delete"
}

export class GuildCommand extends Command {
	constructor() {
		super("command", "Gère les commandes custom");

		this.needPermissions = ["ADMINISTRATOR"];

		this.options = [{
			type: "SUB_COMMAND",
			name: Subcommand.list,
			description: "Liste les commandes custom existantes"
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.add,
			description: "Ajoute une commande custom",
			options: [{
				type: "STRING",
				name: Param.name,
				description: "Nom de la commande custom à ajouter, tout message qui commencera par ce nom appelera cette commande",
				required: true
			}, {
				type: "STRING",
				name: Param.response,
				description: "Réponse de la commande custom (\\n pour les retours à la ligne, et $0, $1 etc pour les paramètres)",
				required: true
			}, {
				type: "BOOLEAN",
				name: Param.adminOnly,
				description: "Est-ce que seulement les admins pourront lancer cete commande custom ?",
				required: true
			}, {
				type: "BOOLEAN",
				name: Param.autoDelete,
				description: "Est-ce que le message qui active la commande doit être supprimé automatiquement ?",
				required: true
			}]
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.remove,
			description: "Supprime une commande custom",
			options: [{
				type: "STRING",
				name: Param.name,
				description: "Nom de la commande custom à supprimer",
				required: true
			}]
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.list)
			return list(interaction);

		if (!this.hasPermissions(interaction)) {
			return this.wrongPermissions(interaction);
		}

		if (subcommand === Subcommand.add)
			return add(interaction);

		if (subcommand === Subcommand.remove)
			return remove(interaction);

		throw Error(`Unexpected subcommand ${subcommand}`);
	}
}
