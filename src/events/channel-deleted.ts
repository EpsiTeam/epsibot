import { DMChannel, NonThreadGuildBasedChannel } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog } from "../entity/ChannelLog.js";
import { IgnoredChannel } from "../entity/IgnoredChannel.js";

export async function channelDeleted(
	chanel: DMChannel | NonThreadGuildBasedChannel
) {
	try {
		console.log(`Channel ${chanel.id} has been deleted, cleaning DB`);

		await Promise.all([
			getRepository(ChannelLog).delete({
				channelId: chanel.id
			}),
			getRepository(IgnoredChannel).delete({
				channelId: chanel.id
			})
		]);
	} catch (err) {
		console.error(`Error while cleaning DB: ${err}`);
	}
}
