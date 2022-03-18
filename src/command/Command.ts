import {
	ApplicationCommandOptionData,
	ChatInputApplicationCommandData,
	CommandInteraction,
	PermissionResolvable
} from "discord.js";

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
	needPermissions: PermissionResolvable[] = [];

	constructor(name: string, description: string) {
		this.name = name;
		this.description = description;
	}

	public get defaultPermission(): boolean {
		return this.availableTo === "everyone";
	}

	/**
	 * Will check the permissions of the member that executed a slash command
	 * againt `this.needPermissions`
	 * @param interaction The slach command interaction
	 * @returns true is the member can execute this command, false otherwise
	 */
	hasPermissions(interaction: CommandInteraction<"cached">): boolean {
		if (!interaction.channel) {
			throw Error(`Command ${interaction.commandName} not executed in a channel, or the channel was not in the cache`);
		}

		const memberPerms =
			interaction.member.permissionsIn(interaction.channel);

		return memberPerms.has(this.needPermissions);
	}

	abstract execute(interaction: CommandInteraction<"cached">): Promise<void>
}
