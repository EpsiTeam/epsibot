import { CommandInteraction } from "discord.js";
import { Command } from "../Command.js";
import { play, PlayParam } from "./play.js";

export class Shifumi extends Command {
	constructor() {
		super("shifumi", "Lance un shifumi contre quelqu'un (pierre feuille ciseau)");

		this.options = [{
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
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		return play(interaction);
	}
}
