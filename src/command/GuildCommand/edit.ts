import { ChatInputCommandInteraction } from "discord.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { getCommandFromName } from "../../util/custom-command/db-query.js";
import { editEmbed } from "./editEmbed.js";
import { editNormal } from "./editNormal.js";

export enum EditParam {
	name = "name",
	roleNeeded = "role",
	autoDelete = "auto_delete"
}
export async function edit(interaction: ChatInputCommandInteraction<"cached">) {
	const name = interaction.options.getString(EditParam.name, true);
	let roleNeeded =
		interaction.options.getRole(EditParam.roleNeeded)?.id ?? null;
	let autoDelete = interaction.options.getBoolean(EditParam.autoDelete);

	// Get existing command
	const command = await getCommandFromName(interaction.guildId, name);

	if (!command) {
		return interaction.reply({
			embeds: [
				{
					description: `La commande custom \`${name}\` n'existe pas, impossible de la modifier`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

	if (roleNeeded === null) roleNeeded = command.roleNeeded;
	if (autoDelete === null) autoDelete = command.autoDelete;

	if (command instanceof CustomCommand)
		return editNormal(interaction, command, roleNeeded, autoDelete);
	if (command instanceof CustomEmbedCommand)
		return editEmbed(interaction, command, roleNeeded, autoDelete);

	throw new Error(
		`The custom command ${name} was neither a CustomCommand nor a CustomEmbedCommand`
	);
}
