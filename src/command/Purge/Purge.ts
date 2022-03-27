import { CommandInteraction } from "discord.js";
import { Command } from "../Command.js";
import { purge } from "./purge-messages.js";

enum Param {
	nb = "nb_to_delete",
	user = "user"
}

export class Purge extends Command {
	constructor() {
		super("purge", "Purge les derniers messages d'un channel");

		this.needPermissions = ["MANAGE_MESSAGES"];

		this.options = [{
			type: "INTEGER",
			name: Param.nb,
			description: "Le nombre de messages à supprimer",
			minValue: 1,
			maxValue: 100,
			required: true
		}, {
			type: "USER",
			name: Param.user,
			description: "L'utilisateur dont il faut supprimer les messages",
			required: false
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		if (!this.hasPermissions(interaction)) {
			return this.wrongPermissions(interaction);
		}

		return purge(interaction);
	}
}
