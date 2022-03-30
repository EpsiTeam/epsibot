import { ApplicationCommandPermissionData, Guild } from "discord.js";
import { EnvVariables } from "../utils/env/EnvVariables.js";
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
		const promisesUpdatePermissions: Promise<unknown[]>[] = [];

		// Setting all commands
		for (const guild of guilds) {
			if (!guild.me?.permissions.has("ADMINISTRATOR")) {
				Logger.error("Epsibot don't have the ADMINISTRATOR permission", guild);
			} else {
				promisesSetCommands.push(
					guild.commands.set(this.commandList)
				);
			}
		}
		// Waiting for pending change
		await Promise.all(promisesSetCommands);

		// Creating the permissions object for owner reserved commands
		const permissions: ApplicationCommandPermissionData[] =
			EnvVariables.owners.map(owner => ({
				id: owner,
				type: "USER",
				permission: true
			}));

		// Updating the permissions of the commands for owners
		for (const guild of guilds) {
			for (const remoteCommand of guild.commands.cache.values()) {
				// Only updating owner commands
				const command = this.commands.get(remoteCommand.name);
				if (!command || command.availableTo !== "owner") continue;

				promisesUpdatePermissions.push(
					guild.commands.permissions.add({
						command: remoteCommand.id,
						permissions: permissions
					})
				);
			}
		}
		// Waiting for pending change
		await Promise.all(promisesUpdatePermissions);
	}
}
