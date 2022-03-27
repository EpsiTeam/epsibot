import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog } from "../../entity/ChannelLog.js";
import { getChannelLogType, getLogDescription, GuildLogType } from "./channel-log-type.js";
import { logType } from "../../entity/ChannelLog.js";

export enum EnableParam {
	logType = "log_type",
	channel = "channel"
}

export async function enable(interaction: CommandInteraction<"cached">) {
	// The type of log we should enable
	const paramLogType = interaction.options.getString(
		EnableParam.logType,
		true
	) as GuildLogType;

	if (paramLogType === GuildLogType.all)
		return enableAllLog(interaction);

	return enableLog(interaction, getChannelLogType(paramLogType));
}

async function enableAllLog(interaction: CommandInteraction<"cached">) {
	const channel = interaction.options.getChannel(EnableParam.channel, true);
	const repo = getRepository(ChannelLog);

	await repo.save([
		new ChannelLog(interaction.guildId, "userJoinLeave", channel.id),
		new ChannelLog(interaction.guildId, "deletedMessage", channel.id),
		new ChannelLog(interaction.guildId, "updatedMessage", channel.id)
	]);

	return interaction.reply({
		embeds: [{
			description: `Tous les logs sont désormais actif sur le channel ${channel}`,
			color: "GREEN"
		}],
		ephemeral: true
	});
}

async function enableLog(interaction: CommandInteraction<"cached">, logType: logType) {
	const channel = interaction.options.getChannel(EnableParam.channel, true);
	const logDescription = getLogDescription(logType);

	await getRepository(ChannelLog).save(new ChannelLog(
		interaction.guildId,
		logType,
		channel.id
	));

	return interaction.reply({
		embeds: [{
			description: `Les logs ${logDescription} sont désormais actif sur le channel ${channel}`,
			color: "GREEN"
		}],
		ephemeral: true
	});
}