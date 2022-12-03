import { CommandInteraction, DiscordAPIError } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { ChannelLog } from "../../database/entity/ChannelLog.js";
import { IgnoredChannel } from "../../database/entity/IgnoredChannel.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";

export async function list(interaction: CommandInteraction<"cached">) {
	const repo = DBConnection.getRepository(ChannelLog);
	const guildId = interaction.guildId;

	// Retrieve all types of log
	const [userLog, deletedLog, updatedLog] = await Promise.all([
		repo.findOneBy({
			guildId,
			logType: "userJoinLeave"
		}),
		repo.findOneBy({
			guildId,
			logType: "deletedMessage"
		}),
		repo.findOneBy({
			guildId,
			logType: "updatedMessage"
		})
	]);

	// -- Some function to help build the list --
	// Get a channel from Discord (not so easy because the channel
	// might have been deleted)
	const getChannel = async (channelId: string) => {
		const deletedChannel = "(channel supprimé)";
		try {
			const channel = await interaction.guild.channels.fetch(channelId);
			return channel?.toString() ?? deletedChannel;
		} catch (err) {
			if (err instanceof DiscordAPIError) {
				// This is a special case where we're sure
				// the channel has been deleted
				if (err?.code === 10003) {
					// Unknown channel
					// Better clean our DB
					await DBConnection.getRepository(IgnoredChannel).remove(
						new IgnoredChannel(interaction.guildId, channelId)
					);
				}
			}
			return deletedChannel;
		}
	};
	// Print a line for a not configured log
	const notConfigured = (logType: string) => `**${logType}** → non configuré`;
	// Print a line for a configured log
	const configured = async (logType: string, channelId: string) => {
		const channel = await getChannel(channelId);
		return `**${logType}** → ${channel}`;
	};
	// Print a line for a type of log
	const configurationMsg = async (
		channelLog: ChannelLog | null,
		logType: string
	) => {
		if (channelLog) {
			return configured(logType, channelLog.channelId);
		} else {
			return notConfigured(logType);
		}
	};

	// Starting building the list
	let message = "";
	message += await configurationMsg(userLog, "Arrivés et départs de membres");
	message +=
		"\n" + (await configurationMsg(deletedLog, "Messages supprimés"));
	message += "\n" + (await configurationMsg(updatedLog, "Messages modifiés"));

	// Retrieve ignored channels
	const ignoredChannels = await DBConnection.getRepository(
		IgnoredChannel
	).findBy({ guildId: interaction.guildId });

	// Finish building the list
	if (ignoredChannels.length > 0) {
		message +=
			"\n\nChannels ignorés (les messages supprimés ou modifés dans ces channels ne seront pas log):";
	}
	for (const ignoredChannel of ignoredChannels) {
		const channel = await getChannel(ignoredChannel.channelId);
		message += `\n${channel}`;
	}

	return interaction.reply({
		embeds: [
			{
				title: "Liste des configurations des logs",
				description: message,
				color: EpsibotColor.info
			}
		],
		ephemeral: true
	});
}
