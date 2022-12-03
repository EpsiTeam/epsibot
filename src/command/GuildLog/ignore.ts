import { ChatInputCommandInteraction } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { IgnoredChannel } from "../../database/entity/IgnoredChannel.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";

export enum IgnoreParam {
	channel = "channel",
	ignored = "ignored"
}

export async function ignore(
	interaction: ChatInputCommandInteraction<"cached">
) {
	const ignored = interaction.options.getBoolean(IgnoreParam.ignored, true);
	const channel = interaction.options.getChannel(IgnoreParam.channel, true);
	const repo = DBConnection.getRepository(IgnoredChannel);

	if (!ignored) {
		await repo.remove(new IgnoredChannel(interaction.guildId, channel.id));

		return interaction.reply({
			embeds: [
				{
					description: `Le channel ${channel} sera maintenant pris en compte pour les logs des messages supprimés ou modifiés`,
					color: EpsibotColor.success
				}
			],
			ephemeral: true
		});
	}

	await repo.save(new IgnoredChannel(interaction.guildId, channel.id));

	return interaction.reply({
		embeds: [
			{
				description: `Le channel ${channel} sera maintenant ignoré pour les logs des messages supprimés ou modifiés`,
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}
