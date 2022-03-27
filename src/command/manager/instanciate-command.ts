import { Command } from "./Command.js";
import { GuildCommand } from "../GuildCommand.js";
import { GuildLog } from "../GuildLog.js";
import { GuildAutoRole } from "../GuildAutoRole.js";
import { GuildEmbedCommand } from "../GuildEmbedCommand.js";
import { Purge } from "../Purge.js";
import { TicTacToe } from "../TicTacToe.js";

/**
 * CommandManager will read this list to create all commands,
 * so fill it when you want your command to be added to the bot
 * @returns A list of instanciated commands
 */
export function instanciateCommands(): Command[] {
	return [
		new GuildLog(),
		new GuildCommand(),
		new GuildEmbedCommand(),
		new GuildAutoRole(),
		new Purge(),
		new TicTacToe()
	];
}
