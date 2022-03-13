import "reflect-metadata";
import { Client, Intents } from "discord.js";
import { CommandManager } from "./command/CommandManager.js";
import { createConnection } from "typeorm";

if (!process.env.DISCORD_TOKEN) {
	console.error("Missing a discord token");
	process.exit();
}
const token = process.env.DISCORD_TOKEN;

createConnection().then(() => console.log("connection created"));

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commandManager = new CommandManager("passing some variable");

client.once("ready", async () => {
	console.log("Ready!");

	if (client.user === null) {
		console.error("No client ID :/");
		return;
	}

	const guildIds: string[] = [];
	for (const guild of client.guilds.cache.values()) {
		console.log(`On guild ${guild.name}`);

		guildIds.push(guild.id);
	}

	commandManager.registerCommands(client.user.id, guildIds);
});

client.on("interactionCreate", async interaction => {
	console.log(interaction.type);

	if (!interaction.isCommand()) return;

	const command = commandManager.commands.get(interaction.commandName);

	if (!command) {
		console.log("Commande does not exist");
		return;
	}

	console.log(interaction.commandName);
	await command.execute(interaction);
});

client.login(token);
