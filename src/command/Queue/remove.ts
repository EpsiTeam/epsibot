import { DBConnection } from "../../database/DBConnection.js";
import { QueueElement } from "../../database/entity/QueueElement.js";

// Remove an element from the queue and update all positions
export async function removeElement(guildId: string, position: number) {
	const repo = DBConnection.getRepository(QueueElement);

	const elements = await repo.findBy({ guildId });

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
}
