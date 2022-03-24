import { Message } from "discord.js";
import { getRepository } from "typeorm";
import { CustomEmbedCommand } from "../entity/CustomEmbedCommand.js";

/**
 * Will check if a custom embed command should be executed on a message,
 * and executes it
 * @param message Message triggering the custom embed command
 */
export async function executeCustomEmbedCommand(message: Message) {
	// Not listening on bots
	if (message.author.bot) return;
	// Only listening on guilds
	if (!message.guild || !message.member) return;

	const lowercase = message.content.toLowerCase();

	// Retrieving all custom commands for this guild
	const customCommands = await getRepository(CustomEmbedCommand).find({
		where: {
			guildId: message.guild.id
		}
	});

	// Checking if there is a custom command to execute
	let choosenCommand: CustomEmbedCommand | undefined = undefined;
	for (const command of customCommands) {
		const name = command.name;
		if (lowercase.startsWith(name.toLowerCase())) {
			// Taking the longest custom command available
			if (!choosenCommand || name.length > choosenCommand.name.length) {
				choosenCommand = command;
			}
		}
	}

	// No custom command in this message!
	if (!choosenCommand) return;

	const messagePromises: Promise<Message>[] = [];

	if (choosenCommand.autoDelete) {
		messagePromises.push(
			message.delete()
		);
	}

	messagePromises.push(
		message.channel.send({
			embeds: [choosenCommand.createEmbed()]
		})
	);

	try {
		await Promise.all([messagePromises]);
	} catch (err) {
		console.error(`Error while executing custom embed command ${choosenCommand.name}: ${err.stack}`);
	}
}
