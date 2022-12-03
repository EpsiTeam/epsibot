import {
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
	Snowflake
} from "discord.js";
import { CommandManager } from "../command/CommandManager.js";
import { EnvVariable } from "./EnvVariable.js";
import { Logger } from "./Logger.js";

async function registerOnGuild(
	guildId: Snowflake,
	commands: RESTPostAPIChatInputApplicationCommandsJSONBody[],
	rest: REST
) {
	Logger.info(`Registering ${commands.length} commands on guild ${guildId}`);

	return rest.put(
		Routes.applicationGuildCommands(EnvVariable.applicationId, guildId),
		{
			body: commands
		}
	);
}

async function registerGlobally(
	commands: RESTPostAPIChatInputApplicationCommandsJSONBody[],
	rest: REST
) {
	Logger.info(`Registering ${commands.length} commands globally`);

	return rest.put(Routes.applicationCommands(EnvVariable.applicationId), {
		body: commands
	});
}

export async function registerCommands() {
	const manager = new CommandManager();
	const commands = manager.commandList.map((command) =>
		command.buildCommandData()
	);
	const rest = new REST({ version: "10" }).setToken(EnvVariable.discordToken);

	if (EnvVariable.production) {
		return registerGlobally(commands, rest);
	}

	return registerOnGuild(EnvVariable.devGuildId, commands, rest);
}
