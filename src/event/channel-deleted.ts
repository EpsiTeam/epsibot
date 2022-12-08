import { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import { DBConnection } from "../database/DBConnection.js";
import { ChannelLog } from "../database/entity/ChannelLog.js";
import { IgnoredChannel } from "../database/entity/IgnoredChannel.js";
import { Logger } from "../util/Logger.js";

export async function channelDeleted(
	channel: DMChannel | NonThreadGuildBasedChannel
) {
	if (channel instanceof DMChannel) return;

	try {
		Logger.info(
			`Channel ${channel.name} has been deleted, cleaning DB`,
			channel.guild
		);

		await Promise.all([
			DBConnection.getRepository(ChannelLog).delete({
				channelId: channel.id
			}),
			DBConnection.getRepository(IgnoredChannel).delete({
				channelId: channel.id
			})
		]);
	} catch (err) {
		Logger.error(`Error while cleaning DB: ${err}`, channel.guild);
	}
}
