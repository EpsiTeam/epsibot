import { Guild } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";
import { Logger } from "../utils/logger/Logger.js";

export async function botInvited(
	commandManager: CommandManager,
	guild: Guild
) {
	const logger = Logger.contextualize(guild);
	if (!guild.me) {
		logger.error("Epsibot has been invited, but guild.me is not defined");
		return;
	}
	if (!guild.me.permissions.has("ADMINISTRATOR")) {
		logger.error("Epsibot has been invited without admin permissions, leaving guild...");
		try {
			return guild.leave();
		} catch (err) {
			logger.error(`Failed to leave guild: ${err.stack}`);
			return;
		}
	}

	logger.info("Epsibot invited to new guild, registerings commands on it");
	try {
		return commandManager.registerCommands([guild]);
	} catch (err) {
		logger.error(`Failed to register commands: ${err.stack}`);
		return;
	}
}

export async function botRemoved(guild: Guild) {
	Logger.warn("Epsibot removed from guild", guild);
}
