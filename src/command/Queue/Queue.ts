import { CommandInteraction } from "discord.js";
import { QueueElement } from "../../entity/QueueElement.js";
import { Command } from "../Command.js";
import { add, AddParam } from "./add.js";
import { cancel, CancelParams } from "./cancel.js";
import { list } from "./list.js";

enum Subcommand {
	list = "list",
	add = "add",
	done = "done",
	cancel = "cancel"
}

export class Queue extends Command {
	constructor() {
		super("queue", "Gère la file d'attente");

		this.needPermissions = ["ADMINISTRATOR"];

		this.options = [{
			type: "SUB_COMMAND",
			name: Subcommand.list,
			description: "Affiche la file d'attente"
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.add,
			description: "Ajoute un élément en fin de file",
			options: [{
				type: "STRING",
				name: AddParam.requester,
				description: "Auteur de la demande",
				required: true
			}, {
				type: "STRING",
				name: AddParam.request,
				description: "Description de la demande (visible pour tous)",
				required: true
			}, {
				type: "STRING",
				name: AddParam.hiddenInformation,
				description: "Informations supplémentaires, cachées de tous",
				required: true
			}]
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.cancel,
			description: "Annule un élément de la file (il sera retiré)",
			options: [{
				type: "INTEGER",
				name: CancelParams.position,
				description: "Position de l'élément à supprimer",
				minValue: 1,
				maxValue: QueueElement.maxElements,
				required: true
			}]
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.list)
			return list(interaction);

		if (!this.hasPermissions(interaction))
			return this.wrongPermissions(interaction);

		if (subcommand === Subcommand.add)
			return add(interaction);

		if (subcommand == Subcommand.cancel)
			return cancel(interaction);

		throw Error(`Unexpected subcommand ${subcommand}`);
	}
}
