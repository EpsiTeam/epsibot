import { Client, GatewayIntentBits, Partials } from "discord.js";
import { subscribeDiscordEvents } from "./util/subscribe-discord-events.js";
import { Logger } from "./util/Logger.js";
import { EnvVariable } from "./util/EnvVariable.js";
import { DBConnection } from "./database/DBConnection.js";

// Initialize Logger
Logger.initialize(!EnvVariable.production);
Logger.info(`Epsibot v${EnvVariable.version} starting`);

await DBConnection.initialize();
Logger.info("DB connection created");

process.on("SIGINT", async () => {
	// Workaround to not screw log because of the ^C in the terminal
	console.log();
	Logger.info("Closing DB connection...");
	await DBConnection.destroy();
	Logger.done("Goodbye!");
	process.exit();
});

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.GuildMember],
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
