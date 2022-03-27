import { CommandInteraction } from "discord.js";
import { Command } from "../Command.js";
import { play, PlayParam } from "./play.js";

export class TicTacToe extends Command {
	constructor() {
		super("tictactoe", "Lance une partie de morpion contre quelqu'un");

		this.options = [{
			type: "USER",
			name: PlayParam.user,
			description: "L'utilisateur contre lequel vous souhaitez jouer",
			required: true
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		return play(interaction);
	}
}
