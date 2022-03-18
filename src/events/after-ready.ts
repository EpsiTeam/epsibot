import { Client, Guild } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";

/**
 * Will create the command manager to register slash commands on Discord
 * @param client The bot instance
 * @returns a CommandManager
 */
export async function afterReady(client: Client) {
	console.log("Logged to Discord");

	const guilds: Guild[] = [];
	for (const guild of client.guilds.cache.values()) {
		guilds.push(guild);
	}
	console.log(`Connected on ${guilds.length} guilds`);

	const commandManager = new CommandManager();
	try {
		await commandManager.registerCommands(guilds);
	} catch (err) {
		throw Error(`Impossible to register slash commands: ${err}`);
	}
	console.log(`Registered ${commandManager.commands.size} commands`);

	return commandManager;
}
