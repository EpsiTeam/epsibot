import { Interaction } from "discord.js";
import { CommandManager } from "../command/manager/CommandManager.js";

/**
 * Handle the execution of a slash command
 */
export async function executeCommand(
	commandManager: CommandManager,
	interaction: Interaction
) {
	// Only taking care of slash commands
	if (!interaction.isCommand()) return;
	// Only if command is in guild
	if (!interaction.inCachedGuild()) {
		console.error(`${interaction.commandName} not executed in a guild, or guild not in cache`);
		return;
	}

	const command = commandManager.commands.get(interaction.commandName);

	if (!command) {
		console.error(`Tried to retrieve command ${interaction.commandName} from CommandManager, but it does not exist`);
		return;
	}

	const subcommand = interaction.options.getSubcommand(false);
	const fullCommand = subcommand ? `/${command.name}/${subcommand}` : `/${command.name}`;

	console.log(`Command ${fullCommand} called by ${interaction.member.user.tag} on guild ${interaction.guild.name}`);
	try {
		await command.execute(interaction);
	} catch (err) {
		console.error(`Error on ${fullCommand}: ${err.stack}`);
	}
}
