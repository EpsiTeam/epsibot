import { Entity, Column, PrimaryColumn } from "typeorm";

export type logType = "userJoinLeave" | "deletedMessage" | "updatedMessage"

@Entity()
export class ChannelLog {
	constructor(
		guildId: string,
		logType: logType,
		channelId: string
	) {
		this.guildId = guildId;
		this.logType = logType;
		this.channelId = channelId;
	}

	@PrimaryColumn() guildId: string;

	@PrimaryColumn() logType: logType;

	@Column() channelId: string;
}
