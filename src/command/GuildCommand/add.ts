import { ChatInputCommandInteraction } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { confirm } from "../../util/confirm/confirm.js";
import { addEmbed } from "./addEmbed.js";
import { addNormal } from "./addNormal.js";

export enum AddParam {
	name = "name",
	embed = "embed",
	adminOnly = "admin_only",
	autoDelete = "auto_delete"
}

export async function add(interaction: ChatInputCommandInteraction<"cached">) {
	const name = interaction.options.getString(AddParam.name, true);

	if (name.length > CustomCommand.maxNameLength) {
		return interaction.reply({
			embeds: [
				{
					description: `Le nom de la commande doit faire moins de ${CustomCommand.maxNameLength} caractères !`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

	await interaction.deferReply();

	// Checking if command already exists
	const [command, embedCommand] = await Promise.all([
		DBConnection.getRepository(CustomCommand).findOneBy({
			guildId: interaction.guildId,
			name
		}),
		DBConnection.getRepository(CustomEmbedCommand).findOneBy({
			guildId: interaction.guildId,
			name
		})
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
