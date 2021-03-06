import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { QueueElement } from "../../entity/QueueElement.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { confirm } from "../../utils/confirm/confirm.js";
import { removeElement } from "./remove.js";


export enum CancelParams {
	position = "position"
}

export async function cancel(interaction: CommandInteraction<"cached">) {
	const position =
		interaction.options.getInteger(CancelParams.position, true);
	const repo = getRepository(QueueElement);

	const element = await repo.findOne({
		where: {
			guildId: interaction.guildId,
			position: position
		}
	});

	if (!element) {
		return interaction.reply({
			embeds: [{
				description: `Il n'y a pas d'élément en position ${position} !`,
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	const confirmation = await confirm(interaction, {
		description: `Confirmer la suppression de la demande de ${element.requester} en position ${position} (${element.request})`,
		labelYes: "Oui",
		labelNo: "Non",
		returnOnTimout: false
	});

	if (!confirmation) return;

	await removeElement(interaction.guildId, position);

	return interaction.followUp({
		embeds: [{
			description: `Demande de ${element.requester} marquée comme annulée (position: ${position})`,
			color: EpsibotColor.success
		}],
		ephemeral: true
	});
}
