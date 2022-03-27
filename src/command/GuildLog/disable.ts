import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { ChannelLog, logType } from "../../entity/ChannelLog.js";
import { GuildLogType, getChannelLogType, getLogDescription } from "./channel-log-type.js";

export enum DisableParam {
	logType = "log_type"
}

export async function disable(interaction: CommandInteraction<"cached">) {
	// The type of log we should enable
	const paramLogType = interaction.options.getString(
		DisableParam.logType,
		true
	) as GuildLogType;

	if (paramLogType === GuildLogType.all)
		return disableAllLog(interaction);

	return disableLog(interaction, getChannelLogType(paramLogType));
}

async function disableAllLog(interaction: CommandInteraction<"cached">) {
	await getRepository(ChannelLog).delete({
		guildId: interaction.guildId
	});

	return interaction.reply({
		embeds: [{
			description: "Tous les logs sont désormais inactif",
			color: "GREEN"
		}],
		ephemeral: true
	});
}

async function disableLog(interaction: CommandInteraction<"cached">, channelLogType: logType) {
	const logDescription = getLogDescription(channelLogType);

	await getRepository(ChannelLog).remove(new ChannelLog(
		interaction.guildId,
		channelLogType
	));

	return interaction.reply({
		embeds: [{
			description: `Les logs ${logDescription} sont désormais inactif`,
			color: "GREEN"
		}],
		ephemeral: true
	});
}
