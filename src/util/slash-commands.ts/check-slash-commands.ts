import { Routes } from "discord.js";
import { EnvVariable } from "../EnvVariable.js";
import { Logger } from "../Logger.js";
import { getRest } from "./get-rest.js";

export async function checkGlobalCommands() {
	const rest = getRest();

	const globalCommands = await rest.get(
		Routes.applicationCommands(EnvVariable.applicationId)
	);

	if (!Array.isArray(globalCommands)) {
		throw new Error(
			`Endpoint to retrieve all commands did not return an array but this: ${globalCommands}`
		);
	}

	const names = globalCommands.map((command) => {
		const name = command?.name;
		if (typeof name !== "string") {
			Logger.warn("One of the slash command seems to have no name");
			return "unknown";
		}
		return name;
	});

	return names;
}

export async function checkGuildCommands(guildId: string) {
	const rest = getRest();

	const guildCommands = await rest.get(
		Routes.applicationGuildCommands(EnvVariable.applicationId, guildId)
	);

	if (!Array.isArray(guildCommands)) {
		throw new Error(
			`Endpoint to retrieve all guild commands did not return an array but this: ${guildCommands}`
		);
	}

	const names = guildCommands.map((command) => {
		const name = command?.name;
		if (typeof name !== "string") {
			Logger.warn("One of the slash command seems to have no name");
			return "unknown";
		}
		return name;
	});

	return names;
}
