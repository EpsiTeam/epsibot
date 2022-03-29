import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { CustomCommand } from "../../entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { confirm } from "../../utils/confirm/confirm.js";
import { addEmbed } from "./addEmbed.js";
import { addNormal } from "./addNormal.js";

export enum AddParam {
	name = "name",
	embed = "embed",
	adminOnly = "admin_only",
	autoDelete = "auto_delete"
}

export async function add(interaction: CommandInteraction<"cached">) {
	const name = interaction.options.getString(AddParam.name, true);

	if (name.length > CustomCommand.maxNameLength) {
		return interaction.reply({
			embeds: [{
				description: `Le nom de la commande doit faire moins de ${CustomCommand.maxNameLength} caractères !`,
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	await interaction.deferReply();

	// Checking if command already exists
	const [command, embedCommand] = await Promise.all([
		getRepository(CustomCommand).findOne(
			new CustomCommand(
				interaction.guildId,
				name
			)
		),
		getRepository(CustomEmbedCommand).findOne(
			new CustomEmbedCommand(
				interaction.guildId,
				name
			)
		)
	]);

	if (command || embedCommand) {
		// Command already exists
		const replace = await confirm(interaction, {
			description: `La commmande \`${name}\` existe déjà, faut il la remplacer ?`,
			returnOnTimout: false,
			color: EpsibotColor.warning
		});

		if (!replace) return;
	}

	const embed = interaction.options.getBoolean(AddParam.embed, true);

	const adminOnly =
		interaction.options.getBoolean(AddParam.adminOnly) ?? false;
	const autoDelete =
		interaction.options.getBoolean(AddParam.autoDelete) ?? false;

	if (embed) {
		return addEmbed(interaction, name, adminOnly, autoDelete);
	} else {
		return addNormal(interaction, name, adminOnly, autoDelete);
	}
}
