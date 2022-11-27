import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class ShifumiScore {
	constructor(
		guildId: string,
		userId: string,
		win: number,
		lose: number,
		draw: number
	) {
		this.guildId = guildId;
		this.userId = userId;
		this.win = win;
		this.lose = lose;
		this.draw = draw;
	}

	@PrimaryColumn() guildId: string;

	@PrimaryColumn() userId: string;

	@Column() win: number;

	@Column() lose: number;

	@Column() draw: number;
}
