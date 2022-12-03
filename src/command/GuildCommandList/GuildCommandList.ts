import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../Command.js";
import { list } from "../GuildCommand/list.js";

export class GuildCommandList extends Command {
	name = "command_list";

	description = "Liste les commandes custom";

	defaultPermission = null;

	options = [];

	protected async execute(
		interaction: ChatInputCommandInteraction<"cached">
	) {
		return list(interaction);
	}
}
