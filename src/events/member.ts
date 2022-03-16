import { GuildMember, PartialGuildMember } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import moment from "moment";

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

	await channel.send({
		embeds: [{
			title: `${member.user.tag} a rejoint le serveur`,
			description: `Bonjour à toi ${member}`,
			footer: {
				icon_url: member.avatarURL() ?? undefined
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

	// Should we display logs?
	if (!channelLog) return;

	const channel = await guild.channels.fetch(channelLog.channelId);

	if (!channel || !channel.isText()) {
		throw Error(`Impossible to send logs on channel ${channel}, maybe it has been deleted or modified`);
	}

	let message: string;
	if (!member.joinedTimestamp) {
		message = `Impossible de récupérer la date d'arrivée de ${member}`;
	} else {
		moment.locale("fr");
		message = `${member} était présent depuis le ${moment(member.joinedTimestamp).format("DD/MM/YYYY")} (${moment(member.joinedTimestamp).fromNow()})`;
	}

	await channel.send({
		embeds: [{
			title: `${member.user.tag} a quitté le serveur`,
			description: message,
			footer: {
				icon_url: member.avatarURL() ?? undefined
			},
			color: "RED"
		}]
	});
}
