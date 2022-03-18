import { Interaction } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";

export async function interactionCreate(
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

	console.log(`Command ${command.name} called by ${interaction.member.user.tag} on guild ${interaction.guild.name}`);
	try {
		await command.execute(interaction);
	} catch (err) {
		console.error(`Error while execution ${command.name}: ${err}`);
	}
}
