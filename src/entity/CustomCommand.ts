import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class CustomCommand {
	static maxNameLength = 50;
	static maxResponseLength = 2000;

	constructor(
		guildId: string,
		name: string,
		response: string,
		adminOnly: boolean,
		autoDelete: boolean
	) {
		this.guildId = guildId;
		this.name = name;
		this.response = response;
		this.adminOnly = adminOnly;
		this.autoDelete = autoDelete;

		if (this.name.length > CustomCommand.maxNameLength) {
			throw Error("Name too long");
		}
	}

	@PrimaryColumn() guildId: string;

	@PrimaryColumn() name: string;

	@Column() response: string;

	@Column() adminOnly: boolean;

	@Column() autoDelete: boolean;
}
