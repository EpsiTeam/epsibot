import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction
} from "discord.js";
import { Command } from "../Command.js";
import { purge } from "./purge-messages.js";

enum Param {
	nb = "nb_to_delete",
	user = "user"
}

export class Purge extends Command {
	constructor() {
		super("purge", "Purge les derniers messages d'un channel");

		this.needPermissions = ["ManageMessages"];

		this.options = [
			{
				type: ApplicationCommandOptionType.Integer,
				name: Param.nb,
				description: "Le nombre de messages à supprimer",
				minValue: 1,
				maxValue: 100,
				required: true
			},
			{
				type: ApplicationCommandOptionType.User,
				name: Param.user,
				description:
					"L'utilisateur dont il faut supprimer les messages",
				required: false
			}
		];
	}

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		if (!this.hasPermissions(interaction)) {
			return this.wrongPermissions(interaction);
		}

		return purge(interaction);
	}
}
