import "reflect-metadata";

import { checkStartup } from "./check-startup.js";
import { Client, Intents } from "discord.js";
import { createConnection } from "typeorm";
import { subscribeDiscordEvents } from "./subscribe-discord-events.js";
import { Logger } from "./utils/logger/Logger.js";
import { EnvVariables } from "./utils/env/EnvVariables.js";

// Stopping node if there is unexpected config
checkStartup();

// This is a function that will call itself
// Using this because we can't use async/await at top level
(async () => {
	try {
		await createConnection();
		Logger.info("DB connection created");
	} catch (err) {
		throw Error(`Failed to create DB connection: ${err}`);
	}

	const client = new Client({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_MESSAGES
		],
		presence: {
			activities: [{
				name: `v${EnvVariables.version}`
			}]
		}
	});

	// Listening to Discord events, such as commands being sent
	subscribeDiscordEvents(client);

	try {
		Logger.debug("Logging in to Discord...");
		await client.login(EnvVariables.discordToken);
	} catch (err) {
		throw Error(`Failed to log to Discord: ${err.stack}`);
	}
})();
