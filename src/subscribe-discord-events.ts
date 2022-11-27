import { Client, ClientEvents } from "discord.js";
import { executeCommand } from "./events/execute-slash-command.js";
import { logMemberJoined, logMemberLeft } from "./events/log-member.js";
import { registerCommands } from "./events/register-commands.js";
import {
	logBulkMessageDelete,
	logMessageDelete,
	logMessageUpdate
} from "./events/log-message.js";
import { botInvited, botRemoved } from "./events/bot-join-left.js";
import { executeCustomCommand } from "./events/execute-custom-command.js";
import { addAutorole } from "./events/add-autorole.js";
import { botRoleUpdated, botUpdated } from "./events/bot-check-admin.js";
import { channelDeleted } from "./events/channel-deleted.js";
import { Logger } from "./utils/logger/Logger.js";

/**
 * Will subscribe a bot to some Discord events
 * @param client The bot that will listen to events
 */
export function subscribeDiscordEvents(client: Client): void {
	// Waiting for the bot to be ready before doing anything
	client.once("ready", async (client) => {
		// Custom fonction to listen to a discord event and catch any error
		const listenAndCatch = <E extends keyof ClientEvents>(
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

		const commandManager = await registerCommands(client);

		/* ------------------ EPSIBOT LIFECYCLE ------------------ */
		// Epsibot has been invited to a new guild
		listenAndCatch(
			"guildCreate",
			async (guild) => await botInvited(commandManager, guild)
		);
		// Epsibot has been removed from a guild
		listenAndCatch("guildDelete", botRemoved);
		// Checking that the bot is still admin after updating him
		listenAndCatch("guildMemberUpdate", botUpdated);
		// Checking that the bot is still admin after updating any role
		listenAndCatch("roleUpdate", botRoleUpdated);
		// Cleaning some DB if a channel is delete
		listenAndCatch("channelDelete", channelDeleted);

		/* ------------------- LOGS IN CHANNEL ------------------- */
		// Log a new member on guild
		listenAndCatch("guildMemberAdd", logMemberJoined);
		// Log a member that left a guild
		listenAndCatch("guildMemberRemove", logMemberLeft);
		// Log a deleted message
		listenAndCatch("messageDelete", logMessageDelete);
		// Log bulk deleted messages
		listenAndCatch("messageDeleteBulk", logBulkMessageDelete);
		// Log an updated message
		listenAndCatch("messageUpdate", logMessageUpdate);

		/* ------------------- COMMANDS ------------------- */
		// Someone used a slash command
		listenAndCatch("interactionCreate", async (interaction) =>
			executeCommand(commandManager, interaction)
		);
		// A new message has been written, maybe a custom command?
		listenAndCatch("messageCreate", executeCustomCommand);

		/* ------------------------ OTHER ------------------------ */
		// Adding the autorole
		listenAndCatch("guildMemberAdd", addAutorole);

		Logger.done("Epsibot fully ready");
	});
}
