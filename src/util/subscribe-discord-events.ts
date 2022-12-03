import { Client, ClientEvents } from "discord.js";
import { executeCommand } from "../event/execute-slash-command.js";
import { logMemberJoined, logMemberLeft } from "../event/log-member.js";
import {
	logBulkMessageDelete,
	logMessageDelete,
	logMessageUpdate
} from "../event/log-message.js";
import { botInvited, botRemoved } from "../event/bot-join-left.js";
import { executeCustomCommand } from "../event/execute-custom-command.js";
import { addAutorole } from "../event/add-autorole.js";
import { botRoleUpdated, botUpdated } from "../event/bot-check-admin.js";
import { channelDeleted } from "../event/channel-deleted.js";
import { Logger } from "./Logger.js";
import { CommandManager } from "../command/CommandManager.js";

/**
 * Will subscribe a bot to some Discord events
 * @param client The bot that will listen to events
 */
export function subscribeDiscordEvents(client: Client): void {
	// Waiting for the bot to be ready before doing anything
	client.once("ready", async (client) => {
		Logger.debug("Logged to Discord");

		const listentoEvent = listenToEventBuilder(client);
		const commandManager = new CommandManager();

		/* ------------------ EPSIBOT LIFECYCLE ------------------ */
		// Epsibot has been invited to a new guild
		listentoEvent(
			"guildCreate",
			async (guild) => await botInvited(commandManager, guild)
		);
		// Epsibot has been removed from a guild
		listentoEvent("guildDelete", botRemoved);
		// Checking that the bot is still admin after updating him
		listentoEvent("guildMemberUpdate", botUpdated);
		// Checking that the bot is still admin after updating any role
		listentoEvent("roleUpdate", botRoleUpdated);
		// Cleaning some DB if a channel is delete
		listentoEvent("channelDelete", channelDeleted);

		/* ------------------- LOGS IN CHANNEL ------------------- */
		// Log a new member on guild
		listentoEvent("guildMemberAdd", logMemberJoined);
		// Log a member that left a guild
		listentoEvent("guildMemberRemove", logMemberLeft);
		// Log a deleted message
		listentoEvent("messageDelete", logMessageDelete);
		// Log bulk deleted messages
		listentoEvent("messageDeleteBulk", logBulkMessageDelete);
		// Log an updated message
		listentoEvent("messageUpdate", logMessageUpdate);

		/* ------------------- COMMANDS ------------------- */
		// Someone used a slash command
		listentoEvent("interactionCreate", async (interaction) =>
			executeCommand(commandManager, interaction)
		);
		// A new message has been written, maybe a custom command?
		listentoEvent("messageCreate", executeCustomCommand);

		/* ------------------------ OTHER ------------------------ */
		// Adding the autorole
		listentoEvent("guildMemberAdd", addAutorole);

		Logger.done("Epsibot fully ready");
	});
}

// Custom fonction to listen to a discord event and catch any error
function listenToEventBuilder(client: Client<true>) {
	return <E extends keyof ClientEvents>(
		event: E,
		listener: (...args: ClientEvents[E]) => Promise<unknown>
	) => {
		client.on(event, (...params) => {
			try {
				listener(...params);
			} catch (err) {
				if (err instanceof Error) {
					Logger.error(err.stack ?? err.message);
				} else {
					Logger.error(`Unknown error: ${err}`);
				}
			}
		});
	};
}
