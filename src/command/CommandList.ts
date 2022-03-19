import { Command } from "./Command.js";
import { GuildCommand } from "./GuildCommand.js";
import { GuildLog } from "./GuildLog.js";
import { Ping } from "./Ping.js";

/**
 * CommandManager will read this list to create all commands,
 * so fill it when you want your command to be added to the bot
 * @returns A list of instanciated commands
 */
export function instanciateCommands(): Command[] {
	return [
		new Ping(),
		new GuildLog(),
		new GuildCommand()
	];
}
