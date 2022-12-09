import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class CustomCommand {
	static maxNameLength = 50 as const;
	static maxResponseLength = 2000 as const;

	constructor(
		guildId: string,
		name: string,
		response: string,
		roleNeeded: string,
		autoDelete: boolean
	) {
		this.guildId = guildId;
		this.name = name;
		this.response = response;
		this.roleNeeded = roleNeeded;
		this.autoDelete = autoDelete;

		if (this.name?.length > CustomCommand.maxNameLength) {
			throw new Error("Name too long");
		}
	}

	@PrimaryColumn() guildId: string;

	@PrimaryColumn() name: string;

	@Column() response: string;

	@Column() roleNeeded: string;

	@Column() autoDelete: boolean;
}
