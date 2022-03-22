import { CommandInteraction } from "discord.js";
import { Command } from "./manager/Command.js";

export class Test extends Command {
	constructor() {
		super("test", "Juste pour les tests");

		this.availableTo = "owner";
	}

	async execute(interaction: CommandInteraction) {
		return interaction.reply("pong");
	}
}
