import { CommandInteraction } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { QueueElement } from "../../database/entity/QueueElement.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { confirm } from "../../util/confirm/confirm.js";
import { removeElement } from "./remove.js";

export async function done(interaction: CommandInteraction<"cached">) {
	const repo = DBConnection.getRepository(QueueElement);
	const element = await repo.findOneBy({
		guildId: interaction.guildId,
		position: 1
	});

	if (!element) {
		return interaction.reply({
			embeds: [
				{
					description: "La file est vide !",
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

	const { answer: confirmation } = await confirm(interaction, {
		description: `Marquer comme terminée la demande de ${element.requester} ? (${element.request})`,
		labelNo: "Non en fait j'ai pas fini"
	});

	if (!confirmation) return;

	await removeElement(interaction.guildId, 1);

	return interaction.followUp({
		embeds: [
			{
				description: `Demande de ${element.requester} marquée comme terminée`,
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}
