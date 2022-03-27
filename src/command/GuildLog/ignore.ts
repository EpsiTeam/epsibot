import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { IgnoredChannel } from "../../entity/IgnoredChannel.js";

export enum IgnoreParam {
	channel = "channel",
	ignored = "ignored"
}

export async function ignore(interaction: CommandInteraction<"cached">) {
	const ignored = interaction.options.getBoolean(IgnoreParam.ignored, true);
	const channel = interaction.options.getChannel(IgnoreParam.channel, true);
	const repo = getRepository(IgnoredChannel);

	if (!ignored) {
		await repo.remove(new IgnoredChannel(
			interaction.guildId,
			channel.id
		));

		return interaction.reply({
			embeds: [{
				description: `Le channel ${channel} sera maintenant pris en compte pour les logs des messages supprimés ou modifiés`,
				color: "GREEN"
			}],
			ephemeral: true
		});
	}

	await repo.save(new IgnoredChannel(
		interaction.guildId,
		channel.id
	));

	return interaction.reply({
		embeds: [{
			description: `Le channel ${channel} sera maintenant ignoré pour les logs des messages supprimés ou modifiés`,
			color: "GREEN"
		}],
		ephemeral: true
	});
}
