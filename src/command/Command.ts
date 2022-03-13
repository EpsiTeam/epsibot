import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export abstract class Command {
	/**
	 * Name of the command, users will be able to use /name
	 */
	readonly name: string;
	/**
	 * Description of the command, users will be able to see this in
	 * the list of commands
	*/
	readonly description: string;

	constructor(commandInfo: {
		name: string,
		description: string
	}) {
		this.name = commandInfo.name;
		this.description = commandInfo.description;
	}

	build() {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.toJSON();
	}

	abstract execute(interaction: CommandInteraction): Promise<void>
}
