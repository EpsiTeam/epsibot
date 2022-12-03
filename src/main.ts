import { Client, GatewayIntentBits } from "discord.js";
import { subscribeDiscordEvents } from "./util/subscribe-discord-events.js";
import { Logger } from "./util/Logger.js";
import { EnvVariable } from "./util/EnvVariable.js";
import { DBConnection } from "./database/DBConnection.js";

// Initialize Logger
Logger.initialize(!EnvVariable.production);
Logger.info(`Epsibot v${EnvVariable.version} starting`);

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
	throw new Error(`Failed to create DB connection: ${err}`);
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	],
	presence: {
		activities: [
			{
				name: `v${EnvVariable.version}`
			}
		]
	}
});

// Listening to Discord events, such as commands being sent
subscribeDiscordEvents(client);

try {
	Logger.debug("Logging in to Discord...");
	await client.login(EnvVariable.discordToken);
} catch (err) {
	if (err instanceof Error) {
		throw new Error(`Failed to log to Discord: ${err.stack}`);
	} else {
		throw new Error(`Failed to log to Discord with unknown error: ${err}`);
	}
}
