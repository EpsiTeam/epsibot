import { Entity, Column, PrimaryColumn } from "typeorm";

type logType = "userJoinLeave" | "messageDeleteModify"

@Entity()
export class ChannelLog {
	constructor(guildId: string, logType: logType, channelId?: string) {
		this.guildId = guildId;
		this.logType = logType;
		if (channelId) this.channelId = channelId;
	}

	@PrimaryColumn()
		guildId: string;

	@PrimaryColumn()
		logType: logType;

	@Column()
		channelId: string;
}
