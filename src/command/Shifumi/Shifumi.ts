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
		}];
	}

	async execute(interaction: CommandInteraction<"cached">) {
		return play(interaction);
	}
}
