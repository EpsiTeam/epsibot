import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../Command.js";
import { list } from "../Queue/list.js";

export class QueueList extends Command {
	name = "queue_list";

	description = "Affiche la file d'attente";

	defaultPermission = null;

	options = [];

	protected async execute(
		interaction: ChatInputCommandInteraction<"cached">
	) {
		return list(interaction);
	}
}
