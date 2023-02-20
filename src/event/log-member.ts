import { format, formatDuration, intervalToDuration } from "date-fns";
import { ChannelType, GuildMember, PartialGuildMember } from "discord.js";
import { ChannelLog } from "../database/entity/ChannelLog.js";
import { Logger } from "../util/Logger.js";
import { EpsibotColor } from "../util/color/EpsibotColor.js";
import { DBConnection } from "../database/DBConnection.js";
import fr from "date-fns/locale/fr/index.js";

/**
 * Log a new member on guild
 */
export async function logMemberJoined(member: GuildMember) {
	const guild = member.guild;

	Logger.info("Joined guild", guild, member.user);

	const repo = DBConnection.getRepository(ChannelLog);

	const channelLog = await repo.findOneBy({
		guildId: guild.id,
		logType: "userJoinLeave"
	});

	// Should we display logs?
	if (!channelLog) return;

	const channel = await guild.channels.fetch(channelLog.channelId);

	if (!channel || channel.type !== ChannelType.GuildText) {
		throw new Error(
			`Impossible to send logs on channel ${channel}, maybe it has been deleted or modified`
		);
	}

	await channel.send({
		embeds: [
			{
				description: `${member} (${member.user.tag}) a rejoint le serveur`,
				footer: {
					icon_url: member.displayAvatarURL(),
					text: getMemberJoinedDate(member)
				},
				color: EpsibotColor.success
			}
		]
	});
}

/**
 * Log a member that left a guild
 */
export async function logMemberLeft(member: GuildMember | PartialGuildMember) {
	// Maybe it was Epsibot who left?
	if (member.id === member.guild.members.me?.id) return;

	const guild = member.guild;

	Logger.info("Left guild", guild, member.user);

	const repo = DBConnection.getRepository(ChannelLog);

	const channelLog = await repo.findOneBy({
		guildId: guild.id,
		logType: "userJoinLeave"
	});

	if (!channelLog) return;

	const channel = await guild.channels.fetch(channelLog.channelId);

	if (!channel || channel.type !== ChannelType.GuildText) {
		throw new Error(
			`Impossible to send logs on channel ${channel}, maybe it has been deleted or modified`
		);
	}

	await channel.send({
		embeds: [
			{
				description: `${member} (${
					member.user.tag
				}) a quitté le serveur ${getMemberDuration(member)}`,
				footer: {
					icon_url: member.user.displayAvatarURL(),
					text: getMemberJoinedDate(member)
				},
				color: EpsibotColor.error
			}
		]
	});
}

function getMemberDuration(member: GuildMember | PartialGuildMember) {
	if (!member.joinedTimestamp) {
		return "(impossible de savoir combien de temps il est resté)";
	}

	const duration = formatDuration(
		intervalToDuration({
			start: member.joinedTimestamp,
			end: Date.now()
		}),
		{
			locale: fr
		}
	);

	if (!duration) {
		return "immédiatement";
	}

	return `après être resté ${duration}`;
}

function getMemberJoinedDate(member: GuildMember | PartialGuildMember) {
	if (!member.joinedTimestamp) {
		return "Présent depuis une date inconnue";
	}

	const joined = format(member.joinedTimestamp, "dd/MM/yyyy HH:mm");

	return `Présent depuis le ${joined}`;
}
