import { Command } from "./Command.js";
import { GuildCommand } from "./GuildCommand/GuildCommand.js";
import { GuildLog } from "./GuildLog/GuildLog.js";
import { GuildAutoRole } from "./GuildAutoRole/GuildAutoRole.js";
import { Purge } from "./Purge/Purge.js";
import { TicTacToe } from "./TicTacToe/TicTacToe.js";
import { InviteLink } from "./InviteLink/InviteLink.js";
import { Guide } from "./Guide/Guide.js";
import { Help } from "./Help/Help.js";
import { CommandManager } from "./CommandManager.js";
import { Shifumi } from "./Shifumi/Shifumi.js";
import { Queue } from "./Queue/Queue.js";
import { GuildCommandList } from "./GuildCommandList/GuildCommandList.js";
import { QueueList } from "./QueueList/QueueList.js";

/**
 * CommandManager will read this list to create all commands,
 * so fill it when you want your command to be added to the bot
 * @returns A list of instanciated commands
 */
export function instanciateCommands(manager: CommandManager): Command[] {
	return [
		new Guide(),
		new Help(manager),
		new TicTacToe(),
		new Shifumi(),
		new GuildLog(),
		new GuildCommand(),
		new GuildCommandList(),
		new GuildAutoRole(),
		new Queue(),
		new QueueList(),
		new Purge(),
		new InviteLink()
	];
}
