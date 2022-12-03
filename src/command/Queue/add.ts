import { ChatInputCommandInteraction } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { QueueElement } from "../../database/entity/QueueElement.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { Logger } from "../../util/Logger.js";

export enum AddParam {
	requester = "requester",
	request = "request",
	hiddenInformation = "hidden_information"
}

export async function add(interaction: ChatInputCommandInteraction<"cached">) {
	const requester = interaction.options.getString(AddParam.requester, true);
	const request = interaction.options.getString(AddParam.request, true);
	const hiddenInformation = interaction.options.getString(
		AddParam.hiddenInformation,
		true
	);
	let position = 1;

	if (requester.length > QueueElement.maxRequesterLength) {
		return interaction.reply({
			embeds: [
				{
					description: `Le requester doit faire moins de ${QueueElement.maxRequesterLength} caractères !`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}
	if (request.length > QueueElement.maxRequestLength) {
		return interaction.reply({
			embeds: [
				{
					description: `La request doit faire moins de ${QueueElement.maxRequestLength} caractères !`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}
	if (hiddenInformation.length > QueueElement.maxInformationLength) {
		return interaction.reply({
			embeds: [
				{
					description: `Les informations complémentaires doivent faire moins de ${QueueElement.maxInformationLength} caractères !`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

	const repo = DBConnection.getRepository(QueueElement);

	// Finding the position to set
	const elements = await repo.findBy({ guildId: interaction.guildId });
	for (const element of elements) {
		if (element.position >= position) {
			position = element.position + 1;
		}
	}

	if (position > QueueElement.maxElements) {
		return interaction.reply({
			embeds: [
				{
					description: `La file d'attente est déjà pleine ! (${QueueElement.maxElements} elements maximum)`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

	// Saving in the queue
	await repo.save(
		new QueueElement(
			interaction.guildId,
			position,
			requester,
			request,
			hiddenInformation
		)
	);

	// Checking that there is no overlap or holes in the positions
	const newElements = await repo.findBy({ guildId: interaction.guildId });
	const sortedElements = newElements.sort(
		(e1, e2) => e1.position - e2.position
	);
	const elementsToSave: QueueElement[] = [];
	let expected = 1;
	for (const element of sortedElements) {
		if (element.position !== expected) {
			// Something is wrong with the position of this element rewriting it
			Logger.warn(
				`Found queue element with wrong position, moving it from ${element.position} to ${expected}`,
				interaction.guild,
				interaction.user
			);
			element.position = expected;
			elementsToSave.push(element);
		}
		expected++;
	}
	// Saving all elements at once
	if (elementsToSave.length > 0) {
		await repo.save(elementsToSave);
	}

	return interaction.reply({
		embeds: [
			{
				description: `Demande de ${requester} (${request}) ajoutée en position ${position}`,
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});

	// TODO update channel where to display the list
}
