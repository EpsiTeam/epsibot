import { Guild } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";
import { Logger } from "../util/Logger.js";

export async function botInvited(commandManager: CommandManager, guild: Guild) {
	const logger = Logger.contextualize(guild);
	if (!guild.members.me) {
		logger.error("Epsibot has been invited, but guild.me is not defined");
		return;
	}
	if (!guild.members.me.permissions.has("Administrator")) {
		logger.error(
			"Epsibot has been invited without admin permissions, leaving guild..."
		);
		try {
			return guild.leave();
		} catch (err) {
			if (err instanceof Error) {
				logger.error(`Failed to leave guild: ${err.stack}`);
			} else {
				logger.error(
					`Failed to leave guild with unknown error: ${err}`
				);
			}
			return;
		}
	}

	logger.info("Epsibot invited to new guild, registerings commands on it");
	try {
		return commandManager.registerCommands([guild]);
	} catch (err) {
		if (err instanceof Error) {
			logger.error(`Failed to register commands: ${err.stack}`);
		} else {
			logger.error(
				`Failed to register commands with unknown error: ${err}`
			);
		}
		return;
	}
}

export async function botRemoved(guild: Guild) {
	Logger.warn("Epsibot removed from guild", guild);
}
