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
	const role = interaction.options.getRole(AddParam.roleNeeded);
	const autoDelete =
		interaction.options.getBoolean(AddParam.autoDelete) ?? false;

	let roleNeeded = "";
	// Saving the role if it's not @everyone
	if (role && role.id !== interaction.guild.roles.everyone.id) {
		roleNeeded = role.id;
	}

	if (embed) {
		return addEmbed(interaction, roleNeeded, autoDelete);
	} else {
		return addNormal(interaction, roleNeeded, autoDelete);
	}
}
