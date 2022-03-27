import { ButtonInteraction, ColorResolvable, CommandInteraction, MessageActionRow, MessageButtonStyle, User } from "discord.js";
import { Logger } from "../utils/logger/Logger.js";
import { Command } from "./manager/Command.js";

enum Subcommand {
	play = "play",
	leaderboard = "leaderboard"
}

enum Param {
	user = "user"
}

enum ButtonAction {
	yes = "yes",
	no = "no"
}

export class TicTacToe extends Command {
	constructor() {
		super("tictactoe", "Permet de faire une partie de morpion");

		this.options = [{
			type: "SUB_COMMAND",
			name: Subcommand.play,
			description: "Lance une partie de morpion contre quelqu'un",
			options: [{
				type: "USER",
				name: Param.user,
				description: "L'utilisateur contre lequel vous souhaitez jouer",
				required: true
			}]
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.leaderboard,
			description: "Affiche le tableau des scores"
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.play) {
			return this.play(interaction);
		} else if (subcommand === Subcommand.leaderboard) {
			return this.leaderboard(interaction);
		}

		throw Error(`Subcommand ${subcommand} not recognized`);
	}

	async leaderboard(interaction: CommandInteraction<"cached">) {
		return interaction.reply("WIP");
	}

	async play(interaction: CommandInteraction<"cached">) {
		const user1 = interaction.options.getUser(Param.user, true);
		const user2 = interaction.member.user;

		const logger =
			Logger.contextualize(interaction.guild, interaction.member.user);

		if (user1.id === user2.id) {
			logger.warn("Both user are the same, but need this for test purposes");
			// TODO uncomment this
			// interaction.reply(/* TODO */)
			// return;
		}

		const message = await interaction.deferReply({ fetchReply: true });

		const promiseConfirm = message.awaitMessageComponent({
			componentType: "BUTTON",
			filter: (click) => click.member.id === user1.id,
			time: 60_000
		});

		await interaction.editReply({
			embeds: [{
				title: "Partie de morpion",
				description: `${user2} défie ${user1} à une partie de morpion\n${user1}, est-ce que tu acceptes le challenge ?`
			}],
			components: [{
				type: "ACTION_ROW",
				components: [{
					type: "BUTTON",
					style: "SUCCESS",
					label: "Oui",
					customId: ButtonAction.yes
				}, {
					type: "BUTTON",
					style: "DANGER",
					label: "Non",
					customId: ButtonAction.no
				}]
			}]
		});

		let confirm: ButtonInteraction;
		try {
			confirm = await promiseConfirm;
		} catch (err) {
			return interaction.editReply({
				embeds: [{
					title: "Partie refusée",
					description: `Désolé ${user2}, mais ${user1} n'a pas répondu`,
					color: "RED"
				}],
				components: []
			});
		}

		if (confirm.customId === ButtonAction.no) {
			return confirm.update({
				embeds: [{
					title: "Partie refusée",
					description: `Désolé ${user2}, mais ${user1} a refusé de jouer contre toi !`,
					color: "RED"
				}],
				components: []
			});
		}

		const game = new TicTacToeGame(user1, user2);
		let click = confirm;

		while (!game.isFinished()) {
			const player = game.getPlayerTurn();

			const promisePlay = message.awaitMessageComponent({
				componentType: "BUTTON",
				filter: (click) => click.member.id === player.id,
				time: 60_000
			});

			await click.update({
				embeds: [{
					title: "Partie de morpion",
					description: `Au tour de ${player} de jouer !`,
					color: game.getPlayerColor(player)
				}],
				components: game.getComponents(false)
			});

			click = await promisePlay;

			const [x, y] = click.customId.split("/");

			try {
				game.play(parseInt(x, 10), parseInt(y, 10));
			} catch (err) {
				return click.update({
					embeds: [{
						title: "Erreur dans la partie",
						description: `Désolé, il y a eu une erreur avec la partie, considérons que c'est un match nul entre ${user1} et ${user2} !`,
						color: "RED"
					}],
					components: []
				});
			}
		}

		const winner = game.winner;
		const result = winner ? `${winner} remporte la partie !` :  "C'est un match nul !";

		return click.update({
			embeds: [{
				title: "Partie terminée",
				description: `Résultat de la partie entre ${user1} et ${user2}:\n${result}`,
				color: winner ? game.getPlayerColor(winner) : "YELLOW"
			}],
			components: game.getComponents(true)
		});
	}
}

type playedCell = "X" | "O";
type emptyCell = "";
type cell = playedCell | emptyCell;
type gameState = [
	[cell, cell, cell],
	[cell, cell, cell],
	[cell, cell, cell]
]

class TicTacToeGame {
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
