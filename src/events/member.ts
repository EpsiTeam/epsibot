import { format, formatDuration, intervalToDuration } from "date-fns";
import fr from "../../node_modules/date-fns/locale/fr/index.js";
import { GuildMember, PartialGuildMember } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";

export async function memberJoined(member: GuildMember) {
	const guild = member.guild;

	console.log(`User ${member.user.tag} [${member.id}] joined guild ${guild.name} [${guild.id}]`);

	const repo = getRepository(ChannelLog);

	const channelLog = await repo.findOne(new ChannelLog(guild.id, "userJoinLeave"));

	// Should we display logs?
	if (!channelLog) return;

	const channel = await guild.channels.fetch(channelLog.channelId);

	if (!channel || !channel.isText()) {
		throw Error(`Impossible to send logs on channel ${channel}, maybe it has been deleted or modified`);
	}

	return channel.send({
		embeds: [{
			title: `${member.user.tag} a rejoint le serveur`,
			description: `Bonjour à toi ${member}`,
			footer: {
				iconURL: member.displayAvatarURL(),
				text: getMemberJoinedDate(member)
			},
			color: "GREEN"
		}]
	});
}

export async function memberLeft(member: GuildMember | PartialGuildMember) {
	const guild = member.guild;

	console.log(`User ${member.user.tag} [${member.id}] left guild ${guild.name} [${guild.id}]`);

	const repo = getRepository(ChannelLog);

	const channelLog = await repo.findOne(new ChannelLog(guild.id, "userJoinLeave"));

	if (!channelLog) return;

	const channel = await guild.channels.fetch(channelLog.channelId);

	if (!channel || !channel.isText()) {
		throw Error(`Impossible to send logs on channel ${channel}, maybe it has been deleted or modified`);
	}

	return channel.send({
		embeds: [{
			title: `${member.user.tag} a quitté le serveur`,
			description: getMemberDuration(member),
			footer: {
				iconURL: member.user.displayAvatarURL(),
				text: getMemberJoinedDate(member)
			},
			color: "RED"
		}]
	});
}

function getMemberDuration(member: GuildMember | PartialGuildMember) {
	if (!member.joinedTimestamp) {
		return `Impossible de savoir combien de temps est resté ${member}`;
	}

	const duration = formatDuration(intervalToDuration({
		start: member.joinedTimestamp,
		end: Date.now()
	}), {
		locale: fr
	});

	return `${member} est resté ${duration}`;
}

function getMemberJoinedDate(member: GuildMember | PartialGuildMember) {
	if (!member.joinedTimestamp) {
		return "Présent depuis une date inconnue";
	}

	const joined = format(member.joinedTimestamp, "dd/MM/yyyy HH:mm");

	return `Présent depuis le ${joined}`;
}
