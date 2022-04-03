import { CommandInteraction } from "discord.js";
import { Command } from "../Command.js";
import { leaderboard } from "./leaderboard.js";
import { play, PlayParam } from "./play.js";

enum Subcommand {
	play = "play",
	leaderboard = "leaderboard"
}

export class Shifumi extends Command {
	constructor() {
		super("shifumi", "Permet de jouer au shifumi");

		this.options = [{
			type: "SUB_COMMAND",
			name: Subcommand.play,
			description: "Lance une partie de shifumi contre quelqu'un",
			options: [{
				type: "USER",
				name: PlayParam.user,
				description: "L'utilisateur contre lequel vous souhaitez jouer",
				required: true
			}, {
				type: "NUMBER",
				name: PlayParam.turnsToWin,
				description: "Le nombre de tours qu'un joueur doit gagner pour gagner la partie (3 par défaut)",
				minValue: 1,
				required: false
			}]
		}, {
			type: "SUB_COMMAND",
			name: Subcommand.leaderboard,
			description: "Voir le tableau des scores du shifumi"
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();


		if (subcommand === Subcommand.play)
			return play(interaction);

		if (subcommand === Subcommand.leaderboard)
			return leaderboard(interaction);

		throw Error(`Unknown subcommand ${subcommand}`);
	}
}
