import { ApplicationCommandOptionData, ChatInputApplicationCommandData, CommandInteraction, PermissionFlags } from "discord.js";

export abstract class Command implements ChatInputApplicationCommandData {
	/**
	 * Name of the command, users will be able to use /name
	 */
	readonly name: string;
	/**
	 * Description of the command, users will be able to see this in
	 * the list of commands
	*/
	readonly description: string;
	/**
	 * Type of the command, CHAT_INPUT being a slash command
	 */
	readonly type = "CHAT_INPUT";
	/**
	 * Options for this command (parameters, subcommand and so and so)
	 */
	options?: ApplicationCommandOptionData[];
	/**
	 * Who can access to this command
	 */
	availableTo: "everyone" | "owner" = "everyone";
	/**
	 * The special permissions needed to execute this command
	 */
	needPermissions: PermissionFlags[] = [];

	constructor(name: string, description: string) {
		this.name = name;
		this.description = description;
	}

	abstract execute(interaction: CommandInteraction): Promise<void>
}
