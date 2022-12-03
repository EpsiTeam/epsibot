import {
	APIApplicationCommandSubcommandOption,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	PermissionFlagsBits
} from "discord.js";
import { Command } from "../Command.js";
import { list } from "./list.js";
import { add, AddParam } from "./add.js";
import { remove, RemoveParam } from "./remove.js";

enum Subcommand {
	list = "list",
	add = "add",
	remove = "remove"
}

export class GuildCommand extends Command {
	name = "command";

	description = "Gère les commandes custom";

	defaultPermission = PermissionFlagsBits.Administrator;

	options: APIApplicationCommandSubcommandOption[] = [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.list,
			description: "Liste les commandes custom existantes"
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.add,
			description: "Ajoute une commande custom",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: AddParam.name,
					description:
						"Nom de la commande custom à ajouter, tout message qui commencera par ce nom appelera cette commande",
					required: true
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: AddParam.embed,
					description:
						"Est-ce que la command doit s'afficher dans un embed ?",
					required: true
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: AddParam.adminOnly,
					description:
						"Est-ce que seulement les admins pourront lancer cete commande custom ?"
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: AddParam.autoDelete,
					description:
						"Est-ce que le message qui active la commande doit être supprimé automatiquement ?"
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.remove,
			description: "Supprime une commande custom",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: RemoveParam.name,
					description: "Nom de la commande custom à supprimer",
					required: true
				}
			]
		}
	];

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.list) return list(interaction);

		if (subcommand === Subcommand.add) return add(interaction);

		if (subcommand === Subcommand.remove) return remove(interaction);

		throw new Error(`Unexpected subcommand ${subcommand}`);
	}
}
