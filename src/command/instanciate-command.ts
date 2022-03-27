import { Command } from "./Command.js";
import { GuildCommand } from "./GuildCommand/GuildCommand.js";
import { GuildLog } from "./GuildLog/GuildLog.js";
import { GuildAutoRole } from "./GuildAutoRole/GuildAutoRole.js";
import { GuildEmbedCommand } from "./GuildEmbedCommand/GuildEmbedCommand.js";
import { Purge } from "./Purge/Purge.js";
import { TicTacToe } from "./TicTacToe/TicTacToe.js";
import { InviteLink } from "./InviteLink/InviteLink.js";

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
		new TicTacToe(),
		new InviteLink()
	];
}
