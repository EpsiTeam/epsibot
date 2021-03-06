import { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import { IgnoredChannel } from "../entity/IgnoredChannel.js";
import { Logger } from "../utils/logger/Logger.js";

export async function channelDeleted(
	channel: DMChannel | NonThreadGuildBasedChannel
) {
	if (channel instanceof DMChannel) return;

	try {
		Logger.info(`Channel ${channel.name} has been deleted, cleaning DB`, channel.guild);

		await Promise.all([
			getRepository(ChannelLog).delete({
				channelId: channel.id
			}),
			getRepository(IgnoredChannel).delete({
				channelId: channel.id
			})
		]);
	} catch (err) {
		Logger.error(`Error while cleaning DB: ${err}`, channel.guild);
	}
}
