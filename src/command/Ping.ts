import { CommandInteraction } from "discord.js";
import { Command } from "./Command.js";

export class Ping extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Juste pour les tests"
		});
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		await interaction.reply("pong");
	}
}
