import { format } from "date-fns";
import { Message, PartialMessage } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import { IgnoredChannel } from "../entity/IgnoredChannel.js";

/**
 * Log a deleted message
 */
export async function logMessageDelete(message: Message | PartialMessage) {
	const guild = message.guild;
	if (!guild || !message.author) return;
	if (message.author.bot) return;

	console.log(`Message deleted in guild ${guild.name} [${guild.id}] for user ${message.author.tag} [${message.author.id}]`);

	// Retrieve the channel where we should log this
	const channelLog = await getRepository(ChannelLog).findOne(
		new ChannelLog(guild.id, "deletedMessage")
	);
	if (!channelLog) return;

	// Check if this channel is ignored
	const ignored = await getRepository(IgnoredChannel).count(
		new IgnoredChannel(guild.id, message.channel.id)
	);
	if (ignored > 0) return;

	// Retrieve the Discord channel
	const channel = await guild.channels.fetch(channelLog.channelId);
	if (!channel || !channel.isText()) {
		console.error(`Impossible to send logs on channel ${channel}, maybe it has been deleted or modified`);
		return;
	}

	const creationDate = format(message.createdTimestamp, "dd/MM/yyyy HH:mm");

	await channel.send({
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

/**
 * Log an updated message
 */
export async function logMessageUpdate(
	oldMsg: Message | PartialMessage,
	newMsg: Message | PartialMessage
) {
	if (oldMsg.content === newMsg.content) return;

	const guild = newMsg.guild;
	const author = newMsg.author;

	if (!guild || !author) return;
	if (author.bot) return;

	console.log(`Message updated in guild ${guild.name} [${guild.id}] for user ${author.tag} [${author.id}]`);

	// Retrieve the channel where we should log this
	const channelLog = await getRepository(ChannelLog).findOne(
		new ChannelLog(guild.id, "updatedMessage")
	);
	if (!channelLog) return;

	// Check if this channel is ignored
	const ignored = await getRepository(IgnoredChannel).count(
		new IgnoredChannel(guild.id, newMsg.channel.id)
	);
	if (ignored > 0) return;

	// Retrieve the Discord channel
	const channel = await guild.channels.fetch(channelLog.channelId);
	if (!channel || !channel.isText()) {
		console.error(`Impossible to send logs on channel ${channel}, maybe it has been deleted or modified`);
		return;
	}

	const creationDate = format(oldMsg.createdTimestamp, "dd/MM/yyyy HH:mm");

	await channel.send({
		embeds: [{
			title: `Message de ${author.tag} modifié`,
			description: `Un message de ${newMsg.member} a été modifié dans ${newMsg.channel}\n[Voir le message modifié](${newMsg.url})\n__Ancien message:__\n${oldMsg.content}`,
			footer: {
				iconURL: author.displayAvatarURL(),
				text: `Message original crée le ${creationDate}`
			},
			color: "YELLOW"
		}]
	});
}
