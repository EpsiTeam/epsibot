import { Client } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";

export async function ready(client: Client) {
	console.log("Logged to Discord");

	if (client.user === null) {
		throw Error("No client ID, something went wrong :/");
	}

	const guildIds: string[] = [];
	for (const guild of client.guilds.cache.values()) {
		guildIds.push(guild.id);
	}
	console.log(`Connected on ${guildIds.length} guilds`);

	const commandManager = new CommandManager();
	try {
		await commandManager.registerCommands(client.user.id, guildIds);
	} catch (err) {
		throw Error(`Impossible to register slash commands: ${err}`);
	}
	console.log(`Registered ${commandManager.commands.size} commands`);

	return commandManager;
}
