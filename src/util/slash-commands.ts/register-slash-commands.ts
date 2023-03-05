import {
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
	Snowflake
} from "discord.js";
import { CommandManager } from "../../command/CommandManager.js";
import { EnvVariable } from "../EnvVariable.js";
import { Logger } from "../Logger.js";
import { getRest } from "./get-rest.js";

async function registerOnGuild(
	guildId: Snowflake,
	commands: RESTPostAPIChatInputApplicationCommandsJSONBody[],
	rest: REST
) {
	Logger.info(
		`Registering ${commands.length} slash commands on guild ${guildId}`
	);

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
	Logger.info(`Registering ${commands.length} slash commands globally`);

	return rest.put(Routes.applicationCommands(EnvVariable.applicationId), {
		body: commands
	});
}

export async function registerSlashCommands() {
	const manager = new CommandManager();
	const commands = manager.commandList.map((command) =>
		command.buildCommandData()
	);
	const rest = getRest();

	if (EnvVariable.production) {
		return registerGlobally(commands, rest);
	}

	return registerOnGuild(EnvVariable.devGuildId, commands, rest);
}
