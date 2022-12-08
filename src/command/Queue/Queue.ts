import {
	APIApplicationCommandSubcommandOption,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	PermissionFlagsBits
} from "discord.js";
import { QueueElement } from "../../database/entity/QueueElement.js";
import { Command } from "../Command.js";
import { add, AddParam } from "./add.js";
import { cancel, CancelParams } from "./cancel.js";
import { done } from "./done.js";
import { list } from "./list.js";
import { move, MoveParams } from "./move.js";
import { admin } from "./admin.js";

enum Subcommand {
	list = "list",
	add = "add",
	done = "done",
	cancel = "cancel",
	move = "move",
	admin = "admin"
}

export class Queue extends Command {
	name = "queue";

	description = "Gère la file d'attente";

	defaultPermission = PermissionFlagsBits.Administrator;

	options: APIApplicationCommandSubcommandOption[] = [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.list,
			description: "Affiche la file d'attente (équivalent à /queue_list)"
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.done,
			description: "Marque comme terminé le premier élément de la file"
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.add,
			description: "Ajoute un élément en fin de file",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: AddParam.requester,
					description: "Auteur de la demande",
					max_length: QueueElement.maxRequesterLength,
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: AddParam.request,
					description:
						"Description de la demande (visible pour tous)",
					max_length: QueueElement.maxRequestLength,
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: AddParam.hiddenInformation,
					description:
						"Informations supplémentaires, cachées de tous",
					max_length: QueueElement.maxInformationLength,
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.cancel,
			description: "Annule un élément de la file (il sera retiré)",
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: CancelParams.position,
					description: "Position de l'élément à supprimer",
					min_value: 1,
					max_value: QueueElement.maxElements,
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.move,
			description: "Déplace un élément de la file",
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: MoveParams.from,
					description: "Position actuelle de l'élément à déplacer",
					min_value: 1,
					max_value: QueueElement.maxElements,
					required: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: MoveParams.to,
					description: "Position souhaité de l'élément",
					min_value: 1,
					max_value: QueueElement.maxElements,
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.admin,
			description: "Affiche la file complète"
		}
	];

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.list) return list(interaction);

		if (subcommand === Subcommand.done) return done(interaction);

		if (subcommand === Subcommand.add) return add(interaction);

		if (subcommand == Subcommand.cancel) return cancel(interaction);

		if (subcommand == Subcommand.move) return move(interaction);

		if (subcommand == Subcommand.admin) return admin(interaction);

		throw new Error(`Unexpected subcommand ${subcommand}`);
	}
}
