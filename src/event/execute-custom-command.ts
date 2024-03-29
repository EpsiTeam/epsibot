import { Message } from "discord.js";
import { DBConnection } from "../database/DBConnection.js";
import { CustomCommand } from "../database/entity/CustomCommand.js";
import { CustomEmbedCommand } from "../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../util/color/EpsibotColor.js";
import { fillArguments } from "../util/custom-command/command-argument.js";
import { Logger } from "../util/Logger.js";

/**
 * Will check if a custom command should be executed on a message,
 * and executes it
 * @param message Message triggering the custom command
 */
export async function executeCustomCommand(message: Message) {
	// Not listening on bots
	if (message.author.bot) return;
	// Only listening on guilds
	if (!message.guild || !message.member) return;

	const lowercase = message.content.toLowerCase();

	// Retrieving all custom commands for this guild
	const [normalCommands, embedCommands] = await Promise.all([
		DBConnection.getRepository(CustomCommand).findBy({
			guildId: message.guild.id
		}),
		DBConnection.getRepository(CustomEmbedCommand).findBy({
			guildId: message.guild.id
		})
	]);

	// Typescript shenanigan to correctly type commands
	const commands = (<(CustomCommand | CustomEmbedCommand)[]>(
		embedCommands
	)).concat(normalCommands);

	// Checking if there is a custom command to execute
	let choosenCommand: CustomCommand | CustomEmbedCommand | undefined =
		undefined;
	for (const command of commands) {
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

	// If this command needs a special role we have to check for it
	if (choosenCommand.roleNeeded) {
		// No check if user is an admin
		if (!message.member.permissions.has("Administrator")) {
			// Checking the role
			if (
				!message.member.roles.cache.some(
					(role) => role.id === choosenCommand?.roleNeeded
				)
			) {
				// The user does not have this role, no command for you
				return;
			}
		}
	}

	let content: string;
	if (choosenCommand instanceof CustomCommand) {
		content = choosenCommand.response;
	} else {
		content = choosenCommand.description;
	}

	const filledContent = fillArguments(
		message.content.substring(choosenCommand.name.length),
		content
	);

	const logger = Logger.contextualize(message.guild, message.member.user);
	try {
		if (choosenCommand.autoDelete) {
			await message.delete();
		}

		if (choosenCommand instanceof CustomCommand) {
			if (filledContent.length > CustomCommand.maxResponseLength) {
				logger.warn(
					`Custom command '${choosenCommand.name}' response was too long`
				);
				await message.channel.send({
					embeds: [
						{
							description: `Je ne peux pas répondre à la commande \`${choosenCommand.name}\`, car la réponse devrait faire ${filledContent.length} caractères et la limite est de ${CustomCommand.maxResponseLength} caractères`,
							color: EpsibotColor.error
						}
					]
				});
				return;
			}

			await message.channel.send({
				content: filledContent
			});
		} else {
			if (
				filledContent.length > CustomEmbedCommand.maxDescriptionLength
			) {
				logger.warn(
					`Custom command '${choosenCommand.name}' description was too long`
				);
				await message.channel.send({
					embeds: [
						{
							description: `Je ne peux pas répondre à la commande \`${choosenCommand.name}\`, car la description devrait faire ${filledContent.length} caractères et la limite est de ${CustomEmbedCommand.maxDescriptionLength} caractères`,
							color: EpsibotColor.error
						}
					]
				});
				return;
			}

			choosenCommand.description = filledContent;
			await message.channel.send({
				embeds: [choosenCommand.createEmbed()]
			});
		}

		logger.debug(`Executed custom command '${choosenCommand.name}'`);
	} catch (err) {
		if (err instanceof Error) {
			logger.error(
				`Error on custom command '${choosenCommand.name}': ${err.stack}`
			);
		} else {
			logger.error(
				`Error on custom command '${choosenCommand.name}' with unknown error: ${err}`
			);
		}
	}
}
