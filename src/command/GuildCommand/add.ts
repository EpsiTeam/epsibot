import { ChatInputCommandInteraction } from "discord.js";
import { addEmbed } from "./addEmbed.js";
import { addNormal } from "./addNormal.js";

export enum AddParam {
	embed = "embed",
	roleNeeded = "role",
	autoDelete = "auto_delete"
}

export async function add(interaction: ChatInputCommandInteraction<"cached">) {
	const embed = interaction.options.getBoolean(AddParam.embed) ?? false;

	const neededRole =
		interaction.options.getRole(AddParam.roleNeeded)?.id ?? "";
	const autoDelete =
		interaction.options.getBoolean(AddParam.autoDelete) ?? false;

	if (embed) {
		return addEmbed(interaction, neededRole, autoDelete);
	} else {
		return addNormal(interaction, neededRole, autoDelete);
	}
}
