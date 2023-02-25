import { Guild } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";
import { EnvVariable } from "../util/EnvVariable.js";
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
			await guild.leave();
			return;
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

	logger.info("Epsibot invited to new guild");
	if (!EnvVariable.production) {
		logger.debug(
			"Epsibot is in dev mode, slash commands won't be registered on this new guild"
		);
	}
}

export async function botRemoved(guild: Guild) {
	Logger.warn("Epsibot removed from guild", guild);
}
