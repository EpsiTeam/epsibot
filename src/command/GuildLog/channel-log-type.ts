import { logType } from "../../entity/ChannelLog.js";

export enum GuildLogType {
	all = "all",
	user = "user",
	deletedMessage = "deleted_message",
	updatedMessage = "updated_message"
}

export function getLogDescription(logType: logType) {
	switch (logType) {
		case "userJoinLeave":
			return "d'arrivés et de départs des membres";
		case "deletedMessage":
			return "des messages supprimés";
		case "updatedMessage":
			return "des messages modifiés";
		default:
			return `de type ${logType}`;
	}
}

export function getChannelLogType(guildLogType: GuildLogType): logType {
	switch (guildLogType) {
		case GuildLogType.user:
			return "userJoinLeave";
		case GuildLogType.deletedMessage:
			return "deletedMessage";
		case GuildLogType.updatedMessage:
			return "updatedMessage";
	}

	throw Error(
		`logType ${guildLogType} is not recognized, don't how which ChannelLog.logType to assign`
	);
}
