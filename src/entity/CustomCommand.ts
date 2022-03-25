import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class CustomCommand {
	static maxNameLength = 50;
	static maxResponseLength = 500;

	constructor(
		guildId: string,
		name: string,
		response?: string,
		adminOnly?: boolean,
		autoDelete?: boolean
	) {
		this.guildId = guildId;
		this.name = name;
		if (response) this.response = response;
		if (adminOnly !== undefined) this.adminOnly = adminOnly;
		if (autoDelete !== undefined) this.autoDelete = autoDelete;
	}

	@PrimaryColumn()
		guildId: string;

	@PrimaryColumn({
		type: "text",
		length: CustomCommand.maxNameLength
	})
		name: string;

	@Column({
		type: "text",
		length: CustomCommand.maxResponseLength
	})
		response: string;

	@Column()
		adminOnly: boolean;

	@Column()
		autoDelete: boolean;
}
