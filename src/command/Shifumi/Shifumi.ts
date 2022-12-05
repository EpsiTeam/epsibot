import {
	APIApplicationCommandSubcommandOption,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction
} from "discord.js";
import { Command } from "../Command.js";
import { leaderboard } from "./leaderboard.js";
import { play, PlayParam } from "./play.js";

enum Subcommand {
	play = "play",
	leaderboard = "leaderboard"
}

export class Shifumi extends Command {
	name = "shifumi";

	description = "Permet de jouer au shifumi";

	defaultPermission = null;

	options: APIApplicationCommandSubcommandOption[] = [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.play,
			description: "Lance une partie de shifumi contre quelqu'un",
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: PlayParam.user,
					description:
						"L'utilisateur contre lequel vous souhaitez jouer",
					required: true
				},
				{
					type: ApplicationCommandOptionType.Number,
					name: PlayParam.turnsToWin,
					description:
						"Le nombre de tours qu'un joueur doit gagner pour gagner la partie (1 par défaut)",
					min_value: 1,
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: Subcommand.leaderboard,
			description: "Voir le tableau des scores du shifumi"
		}
	];

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === Subcommand.play) return play(interaction);

		if (subcommand === Subcommand.leaderboard)
			return leaderboard(interaction);

		throw new Error(`Unknown subcommand ${subcommand}`);
	}
}
