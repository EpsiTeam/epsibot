import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class AutoRole {
	constructor(guildId: string, roleId?: string) {
		this.guildId = guildId;
		if (roleId) this.roleId = roleId;
	}

	@PrimaryColumn()
		guildId: string;

	@Column()
		roleId: string;
}
