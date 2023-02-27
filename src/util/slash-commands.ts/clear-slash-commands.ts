import { Routes } from "discord.js";
import { EnvVariable } from "../EnvVariable.js";
import { Logger } from "../Logger.js";
import { getRest } from "./get-rest.js";

export async function clearSlashCommands() {
	const rest = getRest();

	if (EnvVariable.production) {
		Logger.info(`Clearing all global slash commands`);

		return rest.put(Routes.applicationCommands(EnvVariable.applicationId), {
			body: []
		});
	}

	Logger.info(
		`Clearing all slash commands on guild ${EnvVariable.devGuildId}`
	);

	return rest.put(
		Routes.applicationGuildCommands(
			EnvVariable.applicationId,
			EnvVariable.devGuildId
		),
		{
			body: []
		}
	);
}
