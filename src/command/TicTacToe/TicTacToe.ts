import { CommandInteraction } from "discord.js";
import { Command } from "../Command.js";
import { leaderboard } from "./leaderboard.js";
import { play, PlayParam } from "./play.js";

enum Subcommand {
	play = "play",
	leaderboard = "leaderboard"
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
				name: PlayParam.user,
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

		if (subcommand === Subcommand.play)
			return play(interaction);

		if (subcommand === Subcommand.leaderboard)
			return leaderboard(interaction);

		throw Error(`Subcommand ${subcommand} not recognized`);
	}
}
