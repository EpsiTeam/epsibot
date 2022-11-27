import { Client } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";
import { Logger } from "../utils/logger/Logger.js";

/**
 * Will create the command manager to register slash commands on Discord
 * @param client The bot instance
 * @returns a CommandManager
 */
export async function registerCommands(client: Client) {
	Logger.debug("Logged to Discord");

	const allGuilds = client.guilds.cache;
	Logger.info(`Connected on ${allGuilds.size} guild${allGuilds.size ? "" : "s"}`);

	// Check admin perm
	const [adminGuilds, notAdminGuilds] =
		allGuilds.partition(guild => guild.members.me?.permissions.has("Administrator") ?? false);

	// Leave if not admin
	notAdminGuilds.each(async guild => {
		try {
			Logger.warn("No admin permission, leaving guild", guild);
			await guild.leave();
		} catch (err) {
			if (err instanceof Error)  {
				Logger.error(`Failed to leave guild: ${err.stack}`, guild);
			} else {
				Logger.error(`Failed to leave guild with unknown error: ${err}`, guild);
			}
		}
	});

	const guilds = Array.from(adminGuilds.values());
	Logger.debug(`Registering slash commands on ${guilds.length} guilds...`);

	const commandManager = new CommandManager();
	try {
		await commandManager.registerCommands(guilds);
	} catch (err) {
		throw Error(`Impossible to register slash command: ${err}`);
	}
	Logger.debug(`Registered ${commandManager.commands.size} slash commands on ${guilds.length} guilds`);

	return commandManager;
}
