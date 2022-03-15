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
	readonly commandBuilder: SlashCommandBuilder;

	constructor(commandInfo: {
		name: string,
		description: string
	}) {
		this.name = commandInfo.name;
		this.description = commandInfo.description;
		this.commandBuilder = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description);
	}

	build() {
		if (!this.name) throw Error("Can't register a command without a name");
		if (!this.description) throw Error("Can't register a command without a description");

		return this.commandBuilder.toJSON();
	}

	abstract execute(interaction: CommandInteraction): Promise<void>
}
