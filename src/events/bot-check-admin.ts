import { Guild, GuildMember, PartialGuildMember, Role } from "discord.js";

export async function botCheckAdmin(guild: Guild): Promise<void> {
	if (!guild.me) return;

	// Updating Epsibot is OK, but are we still an admin?
	if (!guild.me.permissions.has("ADMINISTRATOR")) {
		try {
			console.log(`Admin perm was removed in guild ${guild.name} [${guild.id}], leaving it`);
			await guild.leave();
		} catch (err) {
			if (err?.code === 10004) { // Unknown guild
				console.log(`Someone else remove Epsibot from guild ${guild.name} [${guild.id}] (maybe the integration was deleted)`);
			} else {
				console.error(`Failed to leave guild ${guild.name} [${guild.id}]: ${err.stack}`);
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
	console.log(`Epsibot updated in guild ${guild.name} [${guild.id}], checking if bot still admin`);
	await botCheckAdmin(guild);
}

export async function botRoleUpdated(
	_old: Role,
	newRole: Role
) {
	const guild = newRole.guild;
	console.log(`Role updated in guild ${guild.name} [${guild.id}], checking if bot still admin`);
	await botCheckAdmin(guild);
}
