import { Client } from "discord.js";
import { interactionCreate } from "./events/interaction.js";
import { memberJoined, memberLeft } from "./events/member.js";
import { afterReady } from "./events/after-ready.js";
import { messageDelete, messageUpdate } from "./events/message.js";
import { botInvited, botRemoved } from "./events/guild.js";

/**
 * Will subscribe a bot to some Discord events
 * @param client The bot that will listen to events
 */
export function subscribeDiscordEvents(client: Client): void {
	// Waiting for the bot to be ready before doing anything
	client.once("ready", async (client) => {
		const commandManager = await afterReady(client);

		// Someone used a slash command
		client.on("interactionCreate", async (interaction) => {
			try {
				await interactionCreate(commandManager, interaction);
			} catch (err) {
				console.error(`Error on event interactionCreate: ${err}`);
			}
		});
		// New member on guild
		client.on("guildMemberAdd", async member => {
			try {
				await memberJoined(member);
			} catch (err) {
				console.error(`Error on event guildMemberAdd: ${err}`);
			}
		});
		// Member left guild
		client.on("guildMemberRemove", async member => {
			try {
				// Maybe it was Epsibot who left?
				if (member.id === member.guild.me?.id) return;
				await memberLeft(member);
			} catch (err) {
				console.error(`Error on event guildMemberRemove: ${err}`);
			}
		});
		// A message has been delete
		client.on("messageDelete", async message => {
			try {
				await messageDelete(message);
			} catch (err) {
				console.error(`Error on event messageDelete: ${err}`);
			}
		});
		// A message has been modified
		client.on("messageUpdate", async (oldMsg, newMsg) => {
			try {
				await messageUpdate(oldMsg, newMsg);
			} catch (err) {
				console.error(`Error on event messageUpdate: ${err}`);
			}
		});
		// Epsibot has been invited to a new guild
		client.on("guildCreate", async guild => {
			try {
				await botInvited(commandManager, guild);
			} catch (err) {
				console.error(`Error on event guildCreate: ${err}`);
			}
		});
		// Epsibot has been removed from a guild
		client.on("guildDelete", async guild => {
			try {
				await botRemoved(guild);
			} catch (err) {
				console.error(`Error on event guildDelete: ${err}`);
			}
		});

		console.log("Epsibot fully ready");
	});
}
