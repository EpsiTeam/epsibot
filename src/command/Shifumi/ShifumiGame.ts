import { GuildMember } from "discord.js";
import { getShifumiEmoji } from "./play.js";

export enum ShifumiChoice {
	rock = "rock",
	paper = "paper",
	scissors = "scissors"
}

export class ShifumiGame {
	private scores: [number, number] = [0, 0];
	private choices: [ShifumiChoice | null, ShifumiChoice | null] = [
		null,
		null
	];
	private turnWinner: GuildMember | null = null;
	private turnLoser: GuildMember | null = null;
	private turn = 1;

	constructor(
		readonly players: [GuildMember, GuildMember],
		readonly turnsToWin: number
	) {
		if (turnsToWin < 1)
			throw new Error(
				"Can't start a shifumi game with less than one game"
			);
	}

	play(user: GuildMember, choice: ShifumiChoice) {
		if (this.gameFinished())
			throw new Error("Game finished, can't play anymore");

		const index = this.getPlayerIndex(user);

		if (!this.turnFinished() && this.choices[index] !== null) return;

		if (this.turnFinished()) {
			this.choices = [null, null];
			this.turn++;
		}

		this.choices[index] = choice;

		if (this.turnFinished()) {
			if (this.choices[0] === this.choices[1]) {
				this.turnWinner = null;
				this.turnLoser = null;
			} else if (
				(this.choices[0] === ShifumiChoice.rock &&
					this.choices[1] === ShifumiChoice.scissors) ||
				(this.choices[0] === ShifumiChoice.paper &&
					this.choices[1] === ShifumiChoice.rock) ||
				(this.choices[0] === ShifumiChoice.scissors &&
					this.choices[1] === ShifumiChoice.paper)
			) {
				this.scores[0]++;
				this.turnWinner = this.players[0];
				this.turnLoser = this.players[1];
			} else {
				this.scores[1]++;
				this.turnWinner = this.players[1];
				this.turnLoser = this.players[0];
			}
		}
	}

	getTurnWinner(): GuildMember | null {
		if (!this.turnFinished())
			throw new Error(
				"Turn is not finished, impossible to determine winner"
			);

		return this.turnWinner;
	}

	getTurnLoser(): GuildMember | null {
		if (!this.turnFinished())
			throw new Error(
				"Turn is not finished, impossible to determine loser"
			);

		return this.turnLoser;
	}

	turnFinished(): boolean {
		return this.choices[0] !== null && this.choices[1] !== null;
	}

	gameFinished(): boolean {
		return (
			this.scores[0] === this.turnsToWin ||
			this.scores[1] === this.turnsToWin
		);
	}

	getScore(): string {
		const score = `${this.getPoints()}\n__Tour ${this.turn}:__\n`;

		let played = "";
		if (this.turnFinished()) {
			played = `**${
				this.turnWinner?.displayName ?? "Personne ne"
			} gagne ce tour !**\n`;
			played += this.players
				.map((player, index) => {
					return `${player} a joué ${getShifumiEmoji(
						this.choices[index] as ShifumiChoice
					)}`;
				}, this)
				.join(" et ");
			played += "\n\n";
		}

		let wait: string;
		if (this.gameFinished()) {
			wait = `Partie terminée, le gagnant est ${this.turnWinner} !`;
		} else if (this.turnFinished()) {
			wait = `Nouveau tour, en attente d'une réponse de ${this.players[0]} et ${this.players[1]}`;
		} else {
			wait = `En attente d'une réponse de ${this.getWaiting().join(
				" et "
			)}`;
		}

		return score + played + wait;
	}

	getWaiting(): GuildMember[] {
		return this.players.filter(
			(_player, index) => this.choices[index] === null,
			this
		);
	}

	getPlayers(): [GuildMember, GuildMember] {
		return Array.from(this.players) as [GuildMember, GuildMember];
	}

	private getPoints(): string {
		const p1 = this.players[0];
		const s1 = this.scores[0];
		const p2 = this.players[1];
		const s2 = this.scores[1];

		let score = "";
		score += `${p1} → ${s1} point${s1 > 1 ? "s" : ""}\n`;
		score += `${p2} → ${s2} point${s2 > 1 ? "s" : ""}\n`;

		return score;
	}

	private getPlayerIndex(user: GuildMember) {
		const index = this.players.findIndex((player) => player.id === user.id);

		if (index === -1)
			throw new Error("This user can't play on this shifumi");

		return index;
	}
}
