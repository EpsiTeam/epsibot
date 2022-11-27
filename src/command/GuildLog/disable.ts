import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { ChannelLog, logType } from "../../database/entity/ChannelLog.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import {
	GuildLogType,
	getChannelLogType,
	getLogDescription
} from "./channel-log-type.js";

export enum DisableParam {
	logType = "log_type"
}

export async function disable(
	interaction: ChatInputCommandInteraction<"cached">
) {
	// The type of log we should enable
	const paramLogType = interaction.options.getString(
		DisableParam.logType,
		true
	) as GuildLogType;

	if (paramLogType === GuildLogType.all) return disableAllLog(interaction);

	return disableLog(interaction, getChannelLogType(paramLogType));
}

async function disableAllLog(interaction: CommandInteraction<"cached">) {
	await DBConnection.getRepository(ChannelLog).delete({
		guildId: interaction.guildId
	});

	return interaction.reply({
		embeds: [
			{
				description: "Tous les logs sont désormais inactif",
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}

async function disableLog(
	interaction: CommandInteraction<"cached">,
	channelLogType: logType
) {
	const logDescription = getLogDescription(channelLogType);

	await DBConnection.getRepository(ChannelLog).delete({
		guildId: interaction.guildId,
		logType: channelLogType
	});

	return interaction.reply({
		embeds: [
			{
				description: `Les logs ${logDescription} sont désormais inactif`,
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}
