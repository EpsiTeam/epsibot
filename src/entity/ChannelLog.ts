import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class ChannelLog {
	@PrimaryColumn()
		guildID: string;

	@PrimaryColumn()
		logType: "all";

	@Column()
		channelID: string;
}
