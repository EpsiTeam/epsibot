import "reflect-metadata";

import { checkStartup } from "./check-startup.js";
import { Client, GatewayIntentBits } from "discord.js";
import { subscribeDiscordEvents } from "./subscribe-discord-events.js";
import { Logger } from "./utils/logger/Logger.js";
import { EnvVariables } from "./utils/env/EnvVariables.js";
import { DBConnection } from "./DBConnection.js";

// Stopping node if there is unexpected config
checkStartup();

/*
	This is a function that will call itself
	using this because we can't use async/await at top level.
	I mean we could with some tweaks of TS configs but I'm too lazy to do that
	just for this file
*/
try {
	await DBConnection.initialize();
	Logger.info("DB connection created");
} catch (err) {
	throw Error(`Failed to create DB connection: ${err}`);
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages
	],
	presence: {
		activities: [
			{
				name: `v${EnvVariables.version}`
			}
		]
	}
});

// Listening to Discord events, such as commands being sent
subscribeDiscordEvents(client);

try {
	Logger.debug("Logging in to Discord...");
	await client.login(EnvVariables.discordToken);
} catch (err) {
	if (err instanceof Error) {
		throw Error(`Failed to log to Discord: ${err.stack}`);
	} else {
		throw Error(`Failed to log to Discord with unknown error: ${err}`);
	}
}
