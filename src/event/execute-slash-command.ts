import { Interaction } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";
import { Logger } from "../util/Logger.js";

/**
 * Handle the execution of a slash command
 */
export async function executeCommand(
	commandManager: CommandManager,
	interaction: Interaction
) {
	// Only taking care of slash commands
	if (!interaction.isChatInputCommand()) return;

	// Only if command is in guild
	if (!interaction.inCachedGuild()) {
		Logger.error(
			`${interaction.commandName} not executed in a guild (or guild not in cache)`
		);
		return;
	}

	const logger = Logger.contextualize(interaction.guild, interaction.user);
	const command = commandManager.commands.get(interaction.commandName);

	if (!command) {
		logger.error(
			`Tried to retrieve command ${interaction.commandName} from CommandManager, but it does not exist`
		);
		return;
	}

	const subcommand = interaction.options.getSubcommand(false);
	const fullCommand = subcommand
		? `/${command.name}/${subcommand}`
		: `/${command.name}`;

	try {
		await command.checkAndExecute(interaction);
		logger.debug(`Executed command ${fullCommand}`);
	} catch (err) {
		if (err instanceof Error) {
			logger.error(`Error on command ${fullCommand}: ${err.stack}`);
		} else {
			logger.error(
				`Error on command ${fullCommand} with unknown error: ${err}`
			);
		}
	}
}
