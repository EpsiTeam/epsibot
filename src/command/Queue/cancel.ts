import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { QueueElement } from "../../entity/QueueElement.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { confirm } from "../../utils/confirm/confirm.js";


export enum CancelParams {
	position = "position"
}

export async function cancel(interaction: CommandInteraction<"cached">) {
	const position =
		interaction.options.getInteger(CancelParams.position, true);
	const repo = getRepository(QueueElement);

	const elements = await repo.find({
		where: {
			guildId: interaction.guildId
		}
	});

	if (elements.length < position) {
		return interaction.reply({
			embeds: [{
				description: `Il n'y a pas d'élément en position ${position} !`,
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	const confirmation = await confirm(interaction, {
		description: `Confirmer la suppression de l'élément en position ${position}`,
		labelYes: "Ok",
		labelNo: "Annuler",
		returnOnTimout: false
	});

	if (!confirmation) return;

	const elementsToUpdate: QueueElement[] = [];
	for (const element of elements) {
		if (element.position === position) {
			await repo.remove(element);
		}

		if (element.position > position) {
			element.position--;
			elementsToUpdate.push(element);
		}
	}
	await repo.save(elementsToUpdate);

	return interaction.followUp({
		embeds: [{
			description: `Élément à la position ${position} supprimé`,
			color: EpsibotColor.success
		}],
		ephemeral: true
	});
}
