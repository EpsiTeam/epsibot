import { ChatInputCommandInteraction } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { QueueElement } from "../../database/entity/QueueElement.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";

export enum EditParam {
	position = "position",
	requester = "requester",
	request = "request",
	hiddenInformation = "hidden_information"
}

export async function edit(interaction: ChatInputCommandInteraction<"cached">) {
	const position = interaction.options.getInteger(EditParam.position, true);

	const requester = interaction.options.getString(EditParam.requester);
	const request = interaction.options.getString(EditParam.request);
	const hiddenInformation = interaction.options.getString(
		EditParam.hiddenInformation
	);

	if (requester === null && request === null && hiddenInformation === null) {
		return interaction.reply({
			embeds: [
				{
					description: `Il n'y a rien à modifier, je ne peux rien faire !`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

	const repo = DBConnection.getRepository(QueueElement);

	const element = await repo.findOneBy({
		guildId: interaction.guildId,
		position
	});

	if (!element) {
		return interaction.reply({
			embeds: [
				{
					description: `Il n'y a pas d'élément en position ${position} de la file`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

	if (requester !== null) {
		element.requester = requester;
	}
	if (request !== null) {
		element.request = request;
	}
	if (hiddenInformation !== null) {
		element.hiddenInformation = hiddenInformation;
	}

	await repo.save(element);

	return interaction.reply({
		embeds: [
			{
				description: `L'élément en position ${position} a été modifié`,
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}
