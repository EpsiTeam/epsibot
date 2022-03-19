import { Client } from "discord.js";
import { interactionCreate } from "./events/interaction.js";
import { memberJoined, memberLeft } from "./events/member.js";
import { afterReady } from "./events/after-ready.js";
import { messageDelete, messageUpdate } from "./events/message.js";

/**
 * Will subscribe a bot to some Discord events
 * @param client The bot that will listen to events
 */
export function subscribeDiscordEvents(client: Client): void {
	// Waiting for the bot to be ready before doing anything
	client.once("ready", async (client) => {
		const commandManager = await afterReady(client);

		client.on("interactionCreate", async (interaction) => {
			try {
				await interactionCreate(commandManager, interaction);
			} catch (err) {
				console.error(`Error on event interactionCreate: ${err}`);
			}
		});
		client.on("guildMemberAdd", async member => {
			try {
				await memberJoined(member);
			} catch (err) {
				console.error(`Error on event guildMemberAdd: ${err}`);
			}
		});
		client.on("guildMemberRemove", async member => {
			try {
				await memberLeft(member);
			} catch (err) {
				console.error(`Error on event guildMemberRemove: ${err}`);
			}
		});
		client.on("messageDelete", async message => {
			try {
				await messageDelete(message);
			} catch (err) {
				console.error(`Error on event messageDelete: ${err}`);
			}
		});
		client.on("messageUpdate", async (oldMsg, newMsg) => {
			try {
				await messageUpdate(oldMsg, newMsg);
			} catch (err) {
				console.error(`Error on event messageUpdate: ${err}`);
			}
		});

		console.log("Epsibot fully ready");
	});
}
