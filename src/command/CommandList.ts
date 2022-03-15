import { GuildLog } from "./GuildLog.js";
import { Ping } from "./Ping.js";

/**
 * The list of non instantiated commands class.
 * CommandManager will read this list to create all commands.
 */
export const CommandList = [
	Ping,
	GuildLog
];
