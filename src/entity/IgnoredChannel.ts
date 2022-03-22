import { Entity, PrimaryColumn } from "typeorm";

@Entity()
export class IgnoredChannel {
	constructor(
		guildId: string,
		channelId: string
	) {
		this.guildId = guildId;
		this.channelId = channelId;
	}

	@PrimaryColumn()
		guildId: string;

	@PrimaryColumn()
		channelId: string;
}
