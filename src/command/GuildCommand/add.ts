import { ChatInputCommandInteraction } from "discord.js";
import { addEmbed } from "./addEmbed.js";
import { addNormal } from "./addNormal.js";

export enum AddParam {
	embed = "embed",
	adminOnly = "admin_only",
	autoDelete = "auto_delete"
}

export async function add(interaction: ChatInputCommandInteraction<"cached">) {
	const embed = interaction.options.getBoolean(AddParam.embed) ?? false;

	const adminOnly =
		interaction.options.getBoolean(AddParam.adminOnly) ?? false;
	const autoDelete =
		interaction.options.getBoolean(AddParam.autoDelete) ?? false;

	if (embed) {
		return addEmbed(interaction, adminOnly, autoDelete);
	} else {
		return addNormal(interaction, adminOnly, autoDelete);
	}
}
