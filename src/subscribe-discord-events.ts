import { Client } from "discord.js";
import { executeCommand } from "./events/execute-command.js";
import { logMemberJoined, logMemberLeft } from "./events/log-member.js";
import { registerCommands } from "./events/register-commands.js";
import { logBulkMessageDelete, logMessageDelete, logMessageUpdate } from "./events/log-message.js";
import { botInvited, botRemoved } from "./events/bot-join-left.js";
import { executeCustomCommand } from "./events/execute-custom-command.js";
import { addAutorole } from "./events/add-autorole.js";
import { executeCustomEmbedCommand } from "./events/execute-custom-embed-command.js";
import { botRoleUpdated, botUpdated } from "./events/bot-check-admin.js";
import { channelDeleted } from "./events/channel-deleted.js";
import { Logger } from "./utils/logger/Logger.js";

const errorHandler = (err: Error) => Logger.error(err.stack ?? err.message);

/**
 * Will subscribe a bot to some Discord events
 * @param client The bot that will listen to events
 */
export function subscribeDiscordEvents(client: Client): void {
	// Waiting for the bot to be ready before doing anything
	client.once("ready", async (client) => {
		const commandManager = await registerCommands(client);

		/* ------------------ EPSIBOT LIFECYCLE ------------------ */
		// Epsibot has been invited to a new guild
		client.on("guildCreate", async guild => {
			await botInvited(commandManager, guild);
		});
		// Epsibot has been removed from a guild
		client.on("guildDelete", botRemoved);
		// Checking that the bot is still admin after updating him
		client.on("guildMemberUpdate", botUpdated);
		// Checking that the bot is still admin after updating any role
		client.on("roleUpdate", botRoleUpdated);
		// Cleaning some DB if a channel is delete
		client.on("channelDelete", channelDeleted);

		/* ------------------- LOGS IN CHANNEL ------------------- */
		// Log a new member on guild
		client.on(
			"guildMemberAdd",
			member => logMemberJoined(member).catch(errorHandler)
		);
		// Log a member that left a guild
		client.on(
			"guildMemberRemove",
			member => logMemberLeft(member).catch(errorHandler)
		);
		// Log a deleted message
		client.on(
			"messageDelete",
			message => logMessageDelete(message).catch(errorHandler)
		);
		// Log bulk deleted messages
		client.on(
			"messageDeleteBulk",
			messages => logBulkMessageDelete(messages).catch(errorHandler)
		);
		// Log an updated message
		client.on(
			"messageUpdate",
			(oldMsg, newMsg) =>
				logMessageUpdate(oldMsg, newMsg).catch(errorHandler)
		);

		/* ------------------- CUSTOM COMMANDS ------------------- */
		// A new message has been written, maybe a custom command?
		client.on("messageCreate", executeCustomCommand);
		// A new message has been written, maybe a custom embed command?
		client.on("messageCreate", executeCustomEmbedCommand);

		/* ------------------------ OTHER ------------------------ */
		// Someone used a slash command
		client.on("interactionCreate", async (interaction) => {
			await executeCommand(commandManager, interaction);
		});
		// Adding the autorole
		client.on("guildMemberAdd", addAutorole);

		Logger.done("Epsibot fully ready");
	});
}
