import { GuildMember } from "discord.js";
import { getRepository } from "typeorm";
import { AutoRole } from "../entity/AutoRole.js";

export async function addAutorole(member: GuildMember) {
	const autorole = await getRepository(AutoRole).findOne(
		new AutoRole(member.guild.id)
	);

	// Autorole not configured
	if (!autorole) return;

	const role = await member.guild.roles.fetch(autorole.roleId);

	// Autorole configured, but role does not exist anymore
	if (!role) {
		console.error(`Impossible to add non-existing autorole in guild ${member.guild.name} [${member.guild.id}] for ${member.user.tag} [${member.user.id}]`);
		return;
	}

	if (!member.guild.me) {
		console.error("guild.me is null, no idea why (has the bot been kicked?)");
		return;
	}

	const roleBelowBot: boolean =
		member.guild.roles.comparePositions(
			role,
			member.guild.me.roles.highest
		) < 0;

	if (!roleBelowBot) {
		console.error(`Impossible to add higher autorole in guild ${member.guild.name} [${member.guild.id}] for ${member.user.tag} [${member.user.id}]`);
		return;
	}

	await member.roles.add(role, "Adding this role to all new members");
	console.log(`Autorole ${role.name} added to ${member.user.tag} [${member.user.id}] in guild ${member.guild.name} [${member.guild.id}]`);
}
