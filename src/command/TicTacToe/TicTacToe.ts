import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction
} from "discord.js";
import { Command } from "../Command.js";
import { play, PlayParam } from "./play.js";

export class TicTacToe extends Command {
	constructor() {
		super("tictactoe", "Lance une partie de morpion contre quelqu'un");

		this.options = [
			{
				type: ApplicationCommandOptionType.User,
				name: PlayParam.user,
				description: "L'utilisateur contre lequel vous souhaitez jouer",
				required: true
			}
		];
	}

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		return play(interaction);
	}
}
