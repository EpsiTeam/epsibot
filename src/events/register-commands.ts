import { Client, Guild } from "discord.js";
import { CommandManager } from "../command/manager/CommandManager.js";

/**
 * Will create the command manager to register slash commands on Discord
 * @param client The bot instance
 * @returns a CommandManager
 */
export async function registerCommands(client: Client) {
	console.log("Logged to Discord");

	// Fetching all guilds
	const partialGuilds = await client.guilds.fetch();
	const promisesGuilds: Promise<Guild>[] = [];
	for (const partialGuild of partialGuilds.values()) {
		promisesGuilds.push(
			partialGuild.fetch()
		);
	}
	const guilds = await Promise.all(promisesGuilds);
	console.log(`Connected on ${guilds.length} guilds, all in cache`);

	const commandManager = new CommandManager();
	try {
		await commandManager.registerCommands(guilds);
	} catch (err) {
		throw Error(`Impossible to register slash commands: ${err}`);
	}
	console.log(`Registered ${commandManager.commands.size} commands`);

	return commandManager;
}
