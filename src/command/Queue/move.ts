import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { QueueElement } from "../../entity/QueueElement.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";

export enum MoveParams {
	from = "from",
	to = "to"
}

export async function move(interaction: CommandInteraction<"cached">) {
	const from = interaction.options.getInteger(MoveParams.from, true);
	const to = interaction.options.getInteger(MoveParams.to, true);
	const repo = getRepository(QueueElement);

	const elements = await repo.find({
		where: {
			guildId: interaction.guildId
		}
	});

	const sortedElements = elements.sort(
		(e1, e2) => e1.position - e2.position
	);
	const elementsToUpdate: QueueElement[] = [];
	let expected = 1;
	let moved = false;
	for (const element of sortedElements) {
		if (element.position === from) {
			// Moving the element we wanted to originally move
			element.position = Math.min(to, elements.length);
			elementsToUpdate.push(element);
			moved = true;
		} else {
			// In case there was something wrong in the DB
			if (element.position !== expected) {
				element.position = expected;
				elementsToUpdate.push(element);
			}

			// Moving other elements if needed
			if (
				(
					from > to &&
					element.position >= to &&
					element.position <= from
				) || (
					from < to &&
					element.position >= from &&
					element.position <= to
				)
			) {
				if (from > to) {
					element.position++;
				} else if (to > from) {
					element.position--;
				}
				elementsToUpdate.push(element);
			}
		}
		expected++;
	}

	if (!moved) {
		return interaction.reply({
			embeds: [{
				description: `Aucun élément n'a été trouvé à la position ${from}`,
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	await repo.save(elementsToUpdate);

	return interaction.reply({
		embeds: [{
			description: `L'élément à la position ${from} a été déplacé à la position ${Math.min(to, elements.length)}`,
			color: EpsibotColor.success
		}],
		ephemeral: true
	});
}
