import { User, MessageActionRow, ColorResolvable, MessageButtonStyle } from "discord.js";

type playedCell = "X" | "O";
type emptyCell = "";
type cell = playedCell | emptyCell;
type gameState = [
	[cell, cell, cell],
	[cell, cell, cell],
	[cell, cell, cell]
]

export class TicTacToeGame {
	#winner: User | undefined;

	/**
	 * Cell index (x-y):
	 *
	 * ┌─────┬─────┬─────┐
	 * │ 0-0 │ 0-1 │ 0-2 │
	 * ├─────┼─────┼─────┤
	 * │ 1-0 │ 1-1 │ 1-2 │
	 * ├─────┼─────┼─────┤
	 * │ 2-0 │ 2-1 │ 2-2 │
	 * └─────┴─────┴─────┘
	 */
	private state: gameState = [
		["", "", ""],
		["", "", ""],
		["", "", ""]
	];
	private turn: playedCell = "X";
	private lastPlay: [playedCell, number, number] | undefined;

	constructor(readonly playerX: User, readonly playerO: User) {}

	get winner() {
		return this.#winner;
	}

	getPlayerTurn() {
		return this.getPlayer(this.turn);
	}

	play(x: number, y: number) {
		if (this.#winner) {
			throw Error("Impossible to play when the game is won");
		}
		if (!this.isEmtpyCell(this.state[x][y])) {
			throw Error("Cell is not playable");
		}

		this.state[x][y] = this.turn;
		this.lastPlay = [this.turn, x, y];
		this.calculateWinner();
		this.switchTurn();
	}

	isFinished() {
		if (!this.lastPlay) return false;
		if (this.#winner) return true;

		return this.state.flat().every(this.isPlayedCell);
	}

	getComponents(locked: boolean): MessageActionRow[] {
		const components: MessageActionRow[] = [];

		for (const [x, line] of this.state.entries()) {
			const row = new MessageActionRow();
			components.push(row);

			for (const [y, cell] of line.entries()) {
				const color = this.getButtonColor(cell);

				row.addComponents({
					type: "BUTTON",
					label: this.isPlayedCell(cell) ? cell : ".",
					style: color,
					customId: `${x}/${y}`,
					disabled: locked || this.isPlayedCell(cell)
				});
			}
		}

		return components;
	}

	getPlayerColor(user: User): ColorResolvable {
		if (user.id === this.playerX.id) return "BLUE";
		if (user.id === this.playerO.id) return "GREEN";

		throw Error("Unknown player, impossible to get corresponding color");
	}

	private getButtonColor(cell: cell): MessageButtonStyle {
		if (cell === "X") return "PRIMARY";
		if (cell === "O") return "SUCCESS";

		return "SECONDARY";
	}

	private calculateWinner() {
		if (!this.lastPlay) return;
		const [player, x, y] = this.lastPlay;
		const user = this.getPlayer(player);

		// Check on same line as x
		if (
			this.state[x][0] === player &&
			this.state[x][1] === player &&
			this.state[x][2] === player
		) {
			this.#winner = user;
			return;
		}

		// Check on same column as y
		if (
			this.state[0][y] === player &&
			this.state[1][y] === player &&
			this.state[2][y] === player
		) {
			this.#winner = user;
			return;
		}

		// Check diagonal
		if (
			x === y && // only if last play in diagonal
			this.state[0][0] === player &&
			this.state[1][1] === player &&
			this.state[2][2] === player
		) {
			this.#winner = user;
			return;
		}

		// Check antidiagonal
		if (
			( // only if last play in antidiagonal
				(x === 1 && y === 1) ||
				Math.abs(x - y) === 2
			) &&
			this.state[0][2] === player &&
			this.state[1][1] === player &&
			this.state[2][0] === player
		) {
			this.#winner = user;
			return;
		}

		// No winner
	}

	private getPlayer(player: playedCell) {
		if (player === "X") return this.playerX;
		if (player === "O") return this.playerO;

		throw Error("Unknown player");
	}

	private switchTurn() {
		if (this.turn === "X") {
			this.turn = "O";
		} else if (this.turn === "O") {
			this.turn = "X";
		} else {
			throw Error("Turn not switched");
		}
	}

	private isEmtpyCell(cell: cell): cell is emptyCell {
		return cell === "";
	}

	private isPlayedCell(cell: cell): cell is playedCell {
		return cell === "X" || cell === "O";
	}
}
