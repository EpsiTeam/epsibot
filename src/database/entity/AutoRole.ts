import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class AutoRole {
	constructor(guildId: string, roleId: string) {
		this.guildId = guildId;
		this.roleId = roleId;
		this.test = "test";
	}

	@PrimaryColumn() guildId: string;

	@Column() roleId: string;

	@Column() test: string;
}
