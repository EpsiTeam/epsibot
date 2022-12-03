import {
	APIApplicationCommandOption,
	ApplicationCommandType,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	CommandInteraction,
	RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";
import { EpsibotColor } from "../util/color/EpsibotColor.js";
import { EnvVariable } from "../util/EnvVariable.js";

/**
 * This is the base class for all commands,
 * they should all extends this one
 */
export abstract class Command implements ChatInputApplicationCommandData {
	/**
	 * Name of the command, users will be able to use /name
	 */
	abstract readonly name: string;
	/**
	 * Description of the command, users will be able to see this in
	 * the list of commands
	 */
	abstract readonly description: string;
	/**
	 * The special permissions needed to execute this command (null if default is for everyone)
	 */
	abstract readonly defaultPermission: bigint | null;
	/**
	 * Options for this command (parameters, subcommand and so and so)
	 */
	abstract readonly options: APIApplicationCommandOption[];
	/**
	 * Type of the command, CHAT_INPUT being a slash command
	 */
	readonly type = ApplicationCommandType.ChatInput;
	/**
	 * Who can access to this command
	 */
	readonly availableTo: "everyone" | "owner" = "everyone";

	get ownerOnly(): boolean {
		return this.availableTo === "owner";
	}

	buildCommandData(): RESTPostAPIChatInputApplicationCommandsJSONBody {
		return {
			name: this.name,
			description: this.description,
			type: this.type,
			default_member_permissions: this.defaultPermission?.toString(),
			dm_permission: false,
			options: this.options
		};
	}

	/**
	 * Will check if the command is for owners only
	 * @returns true if the user can use this command, false otherwise
	 */
	private async userCanUseCommand(
		interaction: CommandInteraction<"cached">
	): Promise<boolean> {
		if (this.availableTo === "everyone") {
			return true;
		}

		if (EnvVariable.owners.includes(interaction.user.id)) {
			return true;
		}

		// If we're here it means this is an owner only command, and the user is not an owner
		return false;
	}

	/**
	 * Execute the command
	 * @param interaction Slash command interaction that called this command
	 */
	protected abstract execute(
		interaction: ChatInputCommandInteraction<"cached">
	): Promise<unknown>;

	/**
	 * Execute the command while checking for owner permission
	 */
	async checkAndExecute(
		interaction: ChatInputCommandInteraction<"cached">
	): Promise<unknown> {
		if (await this.userCanUseCommand(interaction)) {
			return this.execute(interaction);
		}

		return interaction.reply({
			embeds: [
				{
					title: "Action impossible",
					description:
						"Cette commande est réservé aux owners d'epsibot",
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}
}
