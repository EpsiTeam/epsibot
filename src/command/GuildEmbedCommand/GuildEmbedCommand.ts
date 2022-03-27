import { CommandInteraction } from "discord.js";
import { add, AddParam } from "./add.js";
import { Command } from "../Command.js";
import { remove, RemoveParam } from "./remove.js";
import { list } from "./list.js";

enum Subcommand {
	list = "list",
	add = "add",
	remove = "remove"
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
				name: AddParam.name,
				description: "Nom de la commande custom à ajouter, tout message qui commencera par ce nom appelera cette commande",
				required: true
			}, {
				type: "BOOLEAN",
				name: AddParam.adminOnly,
				description: "Est-ce que seulement les admins pourront lancer cete commande custom ?",
				required: true
			}, {
				type: "BOOLEAN",
				name: AddParam.autoDelete,
				description: "Est-ce que le message qui active la commande doit être supprimé automatiquement ?",
				required: true
			}]
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.remove,
			description: "Supprime une commande embed custom",
			options: [{
				type: "STRING",
				name: RemoveParam.name,
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
