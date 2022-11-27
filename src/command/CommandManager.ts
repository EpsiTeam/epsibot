import { Guild } from "discord.js";
import { Logger } from "../utils/logger/Logger.js";
import { Command } from "./Command.js";
import { instanciateCommands } from "./instanciate-command.js";

/**
 * CommandManager is the class managing commands,
 * used to register them to Discord and keeping a list of them.
 */
export class CommandManager {
	/**
	 * An array of all the commands
	 */
	readonly commandList: Command[];
	/**
	 * A map of command name to commands
	 */
	readonly commands: Map<string, Command>;

	constructor() {
		this.commandList = instanciateCommands(this);

		this.commands = new Map();
		for (const command of this.commandList) {
			this.commands.set(command.name, command);
		}
	}

	/**
	 * Register slash commands on discord guilds<br>
	 * First it will delete all existing slash commands, and recreate them
	 * (to ensure and up to date version)<br>
	 * Then it will update some commmands to have the correct permissions
	 * @param guilds The list of guilds to register slash commands
	 */
	async registerCommands(guilds: Guild[]): Promise<void> {
		const promisesSetCommands: Promise<unknown>[] = [];

		// Setting all commands
		for (const guild of guilds) {
			if (!guild.members.me?.permissions.has("Administrator")) {
				Logger.error(
					"Epsibot don't have the Administrator permission",
					guild
				);
			} else {
				promisesSetCommands.push(guild.commands.set(this.commandList));
			}
		}
		// Waiting for pending change
		await Promise.all(promisesSetCommands);
	}
}
