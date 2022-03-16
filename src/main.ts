import "reflect-metadata";

import { checkStartup } from "./check-startup.js";
import { Client, Intents } from "discord.js";
import { createConnection } from "typeorm";
import { subscribeDiscordEvents } from "./subscribe-discord-events.js";

// Stopping node if there is unepected config
checkStartup();

// This is a function that will call itself
// Using this because we can't use async/await at top level
(async () => {
	try {
		await createConnection();
		console.log("DB connection created");
	} catch (err) {
		throw Error(`Failed to create DB connection: ${err}`);
	}

	const client = new Client({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS
		]
	});

	// Listening on Discord events, such as commands being sent
	subscribeDiscordEvents(client);

	try {
		console.log("Logging in to Discord...");
		await client.login(process.env.DISCORD_TOKEN);
	} catch (err) {
		throw Error(`Failed to log to Discord: ${err}`);
	}
})();
