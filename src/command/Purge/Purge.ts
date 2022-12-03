import {
	APIApplicationCommandIntegerOption,
	APIApplicationCommandUserOption,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	PermissionFlagsBits
} from "discord.js";
import { Command } from "../Command.js";
import { purge } from "./purge-messages.js";

enum Param {
	nb = "nb_to_delete",
	user = "user"
}

export class Purge extends Command {
	name = "purge";

	description = "Purge les derniers messages d'un channel";

	defaultPermission = PermissionFlagsBits.Administrator;

	options: Array<
		APIApplicationCommandIntegerOption | APIApplicationCommandUserOption
	> = [
		{
			type: ApplicationCommandOptionType.Integer,
			name: Param.nb,
			description: "Le nombre de messages à supprimer",
			min_value: 1,
			max_value: 100,
			required: true
		},
		{
			type: ApplicationCommandOptionType.User,
			name: Param.user,
			description: "L'utilisateur dont il faut supprimer les messages",
			required: false
		}
	];

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		return purge(interaction);
	}
}
