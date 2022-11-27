import { format } from "date-fns";
import { ChannelType, Collection, Message, PartialMessage } from "discord.js";
import { DBConnection } from "../DBConnection.js";
import { ChannelLog } from "../entity/ChannelLog.js";
import { IgnoredChannel } from "../entity/IgnoredChannel.js";
import { EpsibotColor } from "../utils/color/EpsibotColor.js";
import { Logger } from "../utils/logger/Logger.js";

/**
 * Log a deleted message
 */
export async function logMessageDelete(message: Message | PartialMessage) {
	const guild = message.guild;
	if (!guild || !message.author) return;
	if (message.author.bot) return;

	Logger.debug("Message deleted", guild, message.author);

	// Retrieve the channel where we should log this
	const channelLog = await DBConnection.getRepository(ChannelLog).findOne({
		where: {
			guildId: guild.id,
			logType: "deletedMessage"
		}
	});
	if (!channelLog) return;

	// Check if this channel is ignored
	const ignored = await DBConnection.getRepository(IgnoredChannel).count({
		where: {
			guildId: guild.id,
			channelId: message.channelId
		}
	});
	if (ignored > 0) return;

	// Retrieve the Discord channel
	const channel = await guild.channels.fetch(channelLog.channelId);
	if (!channel || channel.type !== ChannelType.GuildText) {
		Logger.error(
			`Impossible to send logs on channel ${channelLog.channelId}, maybe it has been deleted or modified`,
			guild,
			message.author
		);
		return;
	}

	const creationDate = format(message.createdTimestamp, "dd/MM/yyyy HH:mm");

	await channel.send({
		embeds: [
			{
				description: `Un message de ${message.member} (${message.author.tag}) a été supprimé dans ${message.channel}:\n\n${message.content}`,
				footer: {
					icon_url: message.author.displayAvatarURL(),
					text: `Message crée le ${creationDate}`
				},
				color: EpsibotColor.warning
			}
		]
	});
}

/**
 * Log deleted messages after a purge<br>
 * All deleted messages will be save in an attachment
 */
export async function logBulkMessageDelete(
	messages: Collection<string, Message<boolean> | PartialMessage>
) {
	const guild = messages.find((message) => message.guild !== null)?.guild;

	if (!guild) {
		Logger.warn(`${messages.size} messages purged (unknown guild)`);
		return;
	}
	const logger = Logger.contextualize(guild);

	logger.info(`${messages.size} messages purged`);

	// Retrieve the channel where we should log this
	const channelLog = await DBConnection.getRepository(ChannelLog).findOne({
		where: {
			guildId: guild.id,
			logType: "deletedMessage"
		}
	});
	if (!channelLog) return;

	const channel = messages.find(
		(message) => message.channel !== null
	)?.channel;
	if (channel) {
		// Check if this channel is ignored
		const ignored = await DBConnection.getRepository(IgnoredChannel).count({
			where: {
				guildId: guild.id,
				channelId: channel.id
			}
		});
		if (ignored > 0) return;
	}

	// Retrieve the Discord channel
	const logChannel = await guild.channels.fetch(channelLog.channelId);
	if (!logChannel || logChannel.type !== ChannelType.GuildText) {
		logger.error(
			`Impossible to send logs on channel ${channelLog.channelId}, maybe it has been deleted or modified`
		);
		return;
	}

	// Creating the attachment of all deleted messages
	const deletedDate = format(new Date(), "dd/MM/yyyy HH:mm");
	let file = `${messages.size} messages supprimés le ${deletedDate}`;

	for (const message of messages.values()) {
		file += "\n\n----------------------------------------------------\n\n";

		const msgDate = format(message.createdAt, "dd/MM/yyyy HH:mm:ss");
		file += `Message de ${
			message.author?.tag ?? "[inconnu]"
		} le ${msgDate}`;
		if (message.embeds.length) {
			file += `\nContient ${message.embeds.length} embeds`;
		}
		if (message.attachments.size) {
			file += `\nContient ${message.attachments.size} liens:`;
			for (const attachment of message.attachments.values()) {
				file += `\n\t${attachment.url} [${
					attachment.contentType ?? "type inconnu"
				}]`;
			}
		}
		if (message.content) {
			file += `\nContenu du message:\n\n${message.content}`;
		}
	}
	const buffer = Buffer.from(file, "ascii");

	await logChannel.send({
		embeds: [
			{
				description: `${
					messages.size
				} messages ont été supprimés dans ${
					channel ?? "(channel inconnu)"
				}`,
				footer: {
					text: `Messages supprimés le ${deletedDate}`
				},
				color: EpsibotColor.warning
			}
		],
		files: [
			{
				name: "deleted_message.txt",
				description: "Sauvegarde des messages supprimés",
				attachment: buffer
			}
		]
	});
}

/**
 * Log an updated message
 */
export async function logMessageUpdate(
	oldMsg: Message | PartialMessage,
	newMsg: Message | PartialMessage
) {
	if (!oldMsg.content) return;
	if (oldMsg.content === newMsg.content) return;

	const guild = newMsg.guild;
	const author = newMsg.author;

	if (!guild || !author) return;
	if (author.bot) return;

	Logger.debug("Message updated", guild, author);

	// Retrieve the channel where we should log this
	const channelLog = await DBConnection.getRepository(ChannelLog).findOne({
		where: {
			guildId: guild.id,
			logType: "updatedMessage"
		}
	});
	if (!channelLog) return;

	// Check if this channel is ignored
	const ignored = await DBConnection.getRepository(IgnoredChannel).count({
		where: {
			guildId: guild.id,
			channelId: newMsg.channelId
		}
	});
	if (ignored > 0) return;

	// Retrieve the Discord channel
	const channel = await guild.channels.fetch(channelLog.channelId);
	if (!channel || channel.type !== ChannelType.GuildText) {
		Logger.error(
			`Impossible to send logs on channel ${channelLog.channelId}, maybe it has been deleted or modified`,
			guild,
			author
		);
		return;
	}

	const creationDate = format(oldMsg.createdTimestamp, "dd/MM/yyyy HH:mm");

	await channel.send({
		embeds: [
			{
				description: `Un message de ${newMsg.member} (${author.tag}) a été modifié dans ${newMsg.channel}\n[Voir le message modifié](${newMsg.url})\n__Ancien message:__\n\n${oldMsg.content}`,
				footer: {
					icon_url: author.displayAvatarURL(),
					text: `Message original crée le ${creationDate}`
				},
				color: EpsibotColor.info
			}
		]
	});
}
