import { GuildMember } from "discord.js";
import { getRepository } from "typeorm";
import { AutoRole } from "../entity/AutoRole.js";
import { Logger } from "../utils/logger/Logger.js";

export async function addAutorole(member: GuildMember) {
	const autorole = await getRepository(AutoRole).findOne(
		new AutoRole(member.guild.id)
	);

	// Autorole not configured
	if (!autorole) return;

	const role = await member.guild.roles.fetch(autorole.roleId);
	const logger = Logger.contextualize(member.guild, member.user);

	// Autorole configured, but role does not exist anymore
	if (!role) {
		logger.error("Impossible to add non-existing autorole");
		return;
	}

	if (!member.guild.me) {
		logger.error("Can't add autorole because guild.me is null, has the bot been kicked?");
		return;
	}

	const roleBelowBot: boolean =
		member.guild.roles.comparePositions(
			role,
			member.guild.me.roles.highest
		) < 0;

	if (!roleBelowBot) {
		logger.error("Impossible to add higher than me autorole");
		return;
	}

	await member.roles.add(role, "Adding this role to all new members");
	logger.info(`Autorole '${role.name}' added`);
}
