import { Client } from "discord.js";
import { interactionCreate } from "./events/interaction.js";
import { ready } from "./events/ready.js";

export function subscribeDiscordEvents(client: Client): void {
	client.once("ready", async (client) => {
		const commandManager = await ready(client);

		client.on("interactionCreate", async (interaction) => {
			interactionCreate(commandManager, interaction);
		});

		console.log("Epsibot fully ready");
	});
}
