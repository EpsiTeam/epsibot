import { Guild, GuildMember, PartialGuildMember, Role } from "discord.js";
import { Logger } from "../utils/logger/Logger.js";

export async function botCheckAdmin(guild: Guild): Promise<void> {
	if (!guild.me) return;

	// Updating Epsibot is OK, but are we still an admin?
	if (!guild.me.permissions.has("ADMINISTRATOR")) {
		const logger = Logger.contextualize(guild);
		try {
			logger.warn("Admin permission was removed, leaving guild...");
			await guild.leave();
		} catch (err) {
			if (err?.code === 10004) { // Unknown guild
				logger.debug("Tried to leave guild, but guild not found (already left)");
			} else {
				logger.error(`Failed to leave guild: ${err.stack}`);
			}
		}
	}
}

export async function botUpdated(
	_old: GuildMember | PartialGuildMember,
	newMember: GuildMember
) {
	const guild = newMember.guild;
	if (newMember.id !== guild.me?.id) return;
	Logger.info("Epsibot updated, checking if bot still admin", guild);
	await botCheckAdmin(guild);
}

export async function botRoleUpdated(
	_old: Role,
	newRole: Role
) {
	const guild = newRole.guild;
	Logger.info("Role updated, checking if bot still admin", guild);
	await botCheckAdmin(guild);
}
