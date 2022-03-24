import { Client } from "discord.js";
import { executeCommand } from "./events/execute-command.js";
import { logMemberJoined, logMemberLeft } from "./events/log-member.js";
import { registerCommands } from "./events/register-commands.js";
import { logMessageDelete, logMessageUpdate } from "./events/log-message.js";
import { botInvited, botRemoved } from "./events/bot-join-left.js";
import { executeCustomCommand } from "./events/execute-custom-command.js";
import { addAutorole } from "./events/add-autorole.js";
import { executeCustomEmbedCommand } from "./events/execute-custom-embed-command.js";
import { botRoleUpdated, botUpdated } from "./events/bot-check-admin.js";

/**
 * Will subscribe a bot to some Discord events
 * @param client The bot that will listen to events
 */
export function subscribeDiscordEvents(client: Client): void {
	// Waiting for the bot to be ready before doing anything
	client.once("ready", async (client) => {
		const commandManager = await registerCommands(client);

		// Someone used a slash command
		client.on("interactionCreate", async (interaction) => {
			await executeCommand(commandManager, interaction);
		});

		// Log a new member on guild
		client.on("guildMemberAdd", logMemberJoined);

		// Log a member that left a guild
		client.on("guildMemberRemove", logMemberLeft);

		// Log a deleted message
		client.on("messageDelete", logMessageDelete);

		// Log an updated message
		client.on("messageUpdate", logMessageUpdate);

		// Epsibot has been invited to a new guild
		client.on("guildCreate", async guild => {
			await botInvited(commandManager, guild);
		});

		// Epsibot has been removed from a guild
		client.on("guildDelete", botRemoved);

		// A new message has been written, maybe a custom command?
		client.on("messageCreate", executeCustomCommand);

		// A new message has been written, maybe a custom command?
		client.on("messageCreate", executeCustomEmbedCommand);

		// Adding the autorole
		client.on("guildMemberAdd", addAutorole);

		client.on("guildMemberUpdate", botUpdated);

		client.on("roleUpdate", botRoleUpdated);

		console.log("Epsibot fully ready");
	});
}
