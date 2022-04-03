import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class ShifumiScore {
	constructor(
		guildId: string,
		userId: string,
		win?: number,
		lose?: number,
		draw?: number
	) {
		this.guildId = guildId;
		this.userId = userId;
		if (win) this.win = win;
		if (lose) this.lose = lose;
		if (draw) this.draw = draw;
	}

	@PrimaryColumn() guildId: string;

	@PrimaryColumn() userId: string;

	@Column() win: number;

	@Column() lose: number;

	@Column() draw: number;
}
