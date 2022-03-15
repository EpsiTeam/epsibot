import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Command } from "./Command.js";
import { CommandList } from "./CommandList.js";

/**
 * CommandManager is the class managing commands,
 * used to register them to Discord and keeping a list of them.
 */
export class CommandManager {
	private commandList: Command[];
	/**
	 * A map of command name to commands
	 */
	readonly commands: Map<string, Command>;

	constructor() {
		this.commandList = CommandList.map(command => new command());

		this.commands = new Map();
		for (const command of this.commandList) {
			this.commands.set(command.name, command);
		}
	}

	/**
	 * Register slash commands on discord guilds
	 * @param clientId The client ID of the bot
	 * @param guildIds The list of guilds to register slash commands
	 */
	async registerCommands(clientId: string, guildIds: string[]): Promise<void> {
		const token = process.env.DISCORD_TOKEN;

		if (!token) {
			throw Error("A Discord token is needed to register slash commands");
		}

		const jsonCommands = this.commandList.map(command => command.build());

		const rest = new REST({ version: "9" }).setToken(token);

		await Promise.all(
			guildIds.map(guildId => rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: jsonCommands }
			))
		);
	}
}
