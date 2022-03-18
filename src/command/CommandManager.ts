import {
	ApplicationCommand,
	ApplicationCommandPermissions,
	ApplicationCommandPermissionData,
	Guild
} from "discord.js";
import { Command } from "./Command.js";
import { instanciateCommands } from "./CommandList.js";

/**
 * CommandManager is the class managing commands,
 * used to register them to Discord and keeping a list of them.
 */
export class CommandManager {
	/**
	 * An array of all the commands
	 */
	private commandList: Command[];
	/**
	 * A map of command name to commands
	 */
	readonly commands: Map<string, Command>;

	constructor() {
		this.commandList = instanciateCommands();

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
		const promisesDeleteCommands: Promise<ApplicationCommand | null>[] = [];
		const promisesCreateCommands: Promise<ApplicationCommand>[] = [];
		const promisesUpdatePermissions:
			Promise<ApplicationCommandPermissions[]>[] = [];

		// We delete all commands on all guilds
		for (const guild of guilds) {
			for (const [id] of await guild.commands.fetch()) {
				promisesDeleteCommands.push(
					guild.commands.delete(id)
				);
			}
		}
		// Waiting for pending change
		await Promise.all(promisesDeleteCommands);

		// We create all commands on all guilds
		for (const guild of guilds) {
			for (const command of this.commandList) {
				promisesCreateCommands.push(
					guild.commands.create({
						name: command.name,
						description: command.description,
						options: command.options,
						type: command.type,
						defaultPermission: command.availableTo === "everyone"
					})
				);
			}
		}
		// Waiting for pending change
		await Promise.all(promisesCreateCommands);

		// Creating the permissions object for owner reserved commands
		if (!process.env.OWNERS) {
			throw Error("Environment variable OWNERS is not set, this is not normal");
		}
		const owners = process.env.OWNERS.split(",");
		const permissions: ApplicationCommandPermissionData[] =
			owners.map(owner => ({
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
