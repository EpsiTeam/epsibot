import { Client } from "discord.js";
import { CommandManager } from "../command/manager/CommandManager.js";

/**
 * Will create the command manager to register slash commands on Discord
 * @param client The bot instance
 * @returns a CommandManager
 */
export async function registerCommands(client: Client) {
	console.log("Logged to Discord");

	const allGuilds = client.guilds.cache;
	console.log(`Connected on ${allGuilds.size} guilds`);

	// Check admin perm
	const [adminGuilds, notAdminGuilds] =
		allGuilds.partition(guild => guild.me?.permissions.has("ADMINISTRATOR") ?? false);

	// Leave if not admin
	notAdminGuilds.each(async guild => {
		try {
			console.log(`No admin perm in guild ${guild.name} [${guild.id}], leaving it`);
			await guild.leave();
		} catch (err) {
			console.error(`Failed to leave guild ${guild.name} [${guild.id}]: ${err.stack}`);
		}
	});

	const guilds = Array.from(adminGuilds.values());
	console.log(`Registering commands on ${guilds.length} guilds`);

	const commandManager = new CommandManager();
	try {
		await commandManager.registerCommands(guilds);
	} catch (err) {
		throw Error(`Impossible to register slash commands: ${err}`);
	}
	console.log(`Registered ${commandManager.commands.size} commands on each guild`);

	return commandManager;
}
