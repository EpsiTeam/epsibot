import { Message } from "discord.js";
import { getRepository } from "typeorm";
import { CustomCommand } from "../entity/CustomCommand.js";
import { fillArguments } from "./command-argument.js";

/**
 * Will check if a custom command should be executed on a message,
 * and executes it
 * @param message Message triggering the custom command
 */
export async function findCustomCommand(message: Message) {
	const lowercase = message.content.toLowerCase();

	if (!message.guild) {
		throw Error("No guild found for this message while checking for custom commands");
	}

	// Retrieving all custom commands for this guild
	const customCommandRepo = getRepository(CustomCommand);
	const customCommands = await customCommandRepo.find({
		where: {
			guildId: message.guild.id
		}
	});

	// Checking if there is a custom command to execute
	let choosenCommand: CustomCommand | undefined = undefined;
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

	const filledCommand = fillArguments(
		message.content.substring(choosenCommand.name.length),
		choosenCommand.response
	);

	await message.channel.send({
		content: filledCommand
	});
}
