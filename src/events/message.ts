import { format } from "date-fns";
import { Message, PartialMessage } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";

export async function messageDelete(message: Message | PartialMessage) {
	const guild = message.guild;
	if (!guild || !message.author) return;

	console.log(`Message deleted in guild ${guild.name} [${guild.id}] for user ${message.author.tag} [${message.author.id}]`);

	const repo = getRepository(ChannelLog);
	const channelLog = await repo.findOne(new ChannelLog(guild.id, "deletedMessage"));

	if (!channelLog) return;

	const channel = await guild.channels.fetch(channelLog.channelId);

	if (!channel || !channel.isText()) {
		throw Error(`Impossible to send logs on channel ${channel}, maybe it has been deleted or modified`);
	}

	const creationDate = format(message.createdTimestamp, "dd/MM/yyyy HH:mm");

	return channel.send({
		embeds: [{
			title: `Message de ${message.author.tag} suprimé`,
			description: `Un message de ${message.member} a été supprimé dans ${message.channel}:\n${message.content}`,
			footer: {
				iconURL: message.author.displayAvatarURL(),
				text: `Message crée le ${creationDate}`
			},
			color: "ORANGE"
		}]
	});
}

export async function messageUpdate(
	oldMsg: Message | PartialMessage,
	newMsg: Message | PartialMessage
) {
	if (oldMsg.content === newMsg.content) return;

	const guild = newMsg.guild;
	const author = newMsg.author;

	if (!guild || !author) return;

	console.log(`Message updated in guild ${guild.name} [${guild.id}] for user ${author.tag} [${author.id}]`);

	const repo = getRepository(ChannelLog);
	const channelLog = await repo.findOne(new ChannelLog(guild.id, "updatedMessage"));

	if (!channelLog) return;

	const channel = await guild.channels.fetch(channelLog.channelId);

	if (!channel || !channel.isText()) {
		throw Error(`Impossible to send logs on channel ${channel}, maybe it has been deleted or modified`);
	}

	const creationDate = format(oldMsg.createdTimestamp, "dd/MM/yyyy HH:mm");

	return channel.send({
		embeds: [{
			title: `Message de ${author.tag} modifié`,
			description: `Un message de ${newMsg.member} a été modifié dans ${newMsg.channel}, l'ancien message était:\n${oldMsg.content}`,
			footer: {
				iconURL: author.displayAvatarURL(),
				text: `Message original crée le ${creationDate}`
			},
			color: "YELLOW"
		}]
	});
}
