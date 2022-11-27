import { CommandInteraction } from "discord.js";
import { DBConnection } from "../../DBConnection.js";
import { QueueElement } from "../../entity/QueueElement.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { confirm } from "../../utils/confirm/confirm.js";
import { removeElement } from "./remove.js";

export async function done(interaction: CommandInteraction<"cached">) {
	const repo = DBConnection.getRepository(QueueElement);
	const element = await repo.findOne({
		where: {
			guildId: interaction.guildId,
			position: 1
		}
	});

	if (!element) {
		return interaction.reply({
			embeds: [{
				description: "La file est vide !",
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	const confirmation = await confirm(interaction, {
		description: `Marquer comme terminée la demande de ${element.requester} ? (${element.request})`,
		labelYes: "Oui",
		labelNo: "Non en fait j'ai pas fini",
		returnOnTimout: false
	});

	if (!confirmation) return;

	await removeElement(interaction.guildId, 1);

	return interaction.followUp({
		embeds: [{
			description: `Demande de ${element.requester} marquée comme terminée`,
			color: EpsibotColor.success
		}],
		ephemeral: true
	});
}
