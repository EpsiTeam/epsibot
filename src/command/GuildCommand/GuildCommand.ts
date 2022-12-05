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
import { help } from "./help.js";

enum Subcommand {
	list = "list",
	add = "add",
	remove = "remove",
	help = "help"
}

export class GuildCommand extends Command {
	name = "command";

	description = "Gère les commandes custom";

	defaultPermission = PermissionFlagsBits.Administrator;

	options: APIApplicationCommandSubcommandOption[] = [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.list,
			description:
				"Liste les commandes custom existantes (équivalent à /command_list)"
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.add,
			description: "Ajoute une commande custom",
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: AddParam.embed,
					description:
						"Est-ce que la command doit s'afficher dans un embed ? Faux par défaut",
					required: false
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: AddParam.adminOnly,
					description:
						"Est-ce que seulement les admins pourront lancer cete commande custom ? Faux par défaut"
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: AddParam.autoDelete,
					description:
						"Est-ce que le message qui active la commande doit être supprimé automatiquement ? Faux par défaut"
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
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.help,
			description:
				"Affiche l'aide pour envoyer des paramètres aux commandes custom"
		}
	];

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
			case Subcommand.list:
				return list(interaction);
			case Subcommand.add:
				return add(interaction);
			case Subcommand.remove:
				return remove(interaction);
			case Subcommand.help:
				return help(interaction);
		}

		throw new Error(`Unexpected subcommand ${subcommand}`);
	}
}
