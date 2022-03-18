import { Client } from "discord.js";
import { interactionCreate } from "./events/interaction.js";
import { memberJoined, memberLeft } from "./events/member.js";
import { afterReady } from "./events/after-ready.js";
import { messageDelete } from "./events/message-delete.js";

/**
 * Will subscribe a bot to some Discord events
 * @param client The bot that will listen to events
 */
export function subscribeDiscordEvents(client: Client): void {
	// Waiting for the bot to be ready before doing anything
	client.once("ready", async (client) => {
		const commandManager = await afterReady(client);

		client.on("interactionCreate", async (interaction) => {
			await interactionCreate(commandManager, interaction);
		});
		client.on("guildMemberAdd", async member => {
			await memberJoined(member);
		});
		client.on("guildMemberRemove", async member => {
			await memberLeft(member);
		});
		client.on("messageDelete", async message => {
			await messageDelete(message);
		});

		console.log("Epsibot fully ready");
	});
}
