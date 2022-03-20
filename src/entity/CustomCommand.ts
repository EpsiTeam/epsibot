import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class CustomCommand {
	static maxResponseLength = 500;

	constructor(
		guildId: string,
		name: string,
		response?: string,
		adminOnly?: boolean
	) {
		this.guildId = guildId;
		this.name = name;
		if (response) this.response = response;
		if (adminOnly !== undefined) this.adminOnly = adminOnly;
	}

	@PrimaryColumn()
		guildId: string;

	@PrimaryColumn()
		name: string;

	@Column({
		type: "text",
		length: CustomCommand.maxResponseLength
	})
		response: string;

	@Column()
		adminOnly: boolean;
}
