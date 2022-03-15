import { Interaction } from "discord.js";
import { CommandManager } from "../command/CommandManager.js";

export async function interactionCreate(commandManager: CommandManager, interaction: Interaction) {
	// Only taking care of slash commands
	if (!interaction.isCommand()) return;

	const command = commandManager.commands.get(interaction.commandName);

	if (!command) {
		console.error(`Tried to retrieve command ${interaction.commandName} from CommandManager, but it does not exist`);
		return;
	}

	console.log(`Called command ${command.name}`);
	try {
		await command.execute(interaction);
	} catch (err) {
		console.error(`Error while execution ${command.name}: ${err}`);
	}
}
