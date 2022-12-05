import { Client, ClientEvents, Events } from "discord.js";
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
	client.once(Events.ClientReady, async (client) => {
		Logger.debug("Logged to Discord");

		const listentoEvent = listenToEventBuilder(client);
		const commandManager = new CommandManager();

		/* ------------------ EPSIBOT LIFECYCLE ------------------ */
		// Epsibot has been invited to a new guild
		listentoEvent(
			Events.GuildCreate,
			async (guild) => await botInvited(commandManager, guild)
		);
		// Epsibot has been removed from a guild
		listentoEvent(Events.GuildDelete, botRemoved);
		// Checking that the bot is still admin after updating him
		listentoEvent(Events.GuildMemberUpdate, botUpdated);
		// Checking that the bot is still admin after updating any role
		listentoEvent(Events.GuildRoleUpdate, botRoleUpdated);
		// Cleaning some DB if a channel is delete
		listentoEvent(Events.ChannelDelete, channelDeleted);

		/* ------------------- LOGS IN CHANNEL ------------------- */
		// Log a new member on guild
		listentoEvent(Events.GuildMemberAdd, logMemberJoined);
		// Log a member that left a guild
		listentoEvent(Events.GuildMemberRemove, logMemberLeft);
		// Log a deleted message
		listentoEvent(Events.MessageDelete, logMessageDelete);
		// Log bulk deleted messages
		listentoEvent(Events.MessageBulkDelete, logBulkMessageDelete);
		// Log an updated message
		listentoEvent(Events.MessageUpdate, logMessageUpdate);

		/* ------------------- COMMANDS ------------------- */
		// Someone used a slash command
		listentoEvent(Events.InteractionCreate, async (interaction) =>
			executeCommand(commandManager, interaction)
		);
		// A new message has been written, maybe a custom command?
		listentoEvent(Events.MessageCreate, executeCustomCommand);

		/* ------------------------ OTHER ------------------------ */
		// Adding the autorole
		listentoEvent(Events.GuildMemberAdd, addAutorole);

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
