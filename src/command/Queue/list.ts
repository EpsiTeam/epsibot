import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import { QueueElement } from "../../entity/QueueElement.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";

export async function list(interaction: CommandInteraction<"cached">) {
	const elements = await getRepository(QueueElement).find({
		where: {
			guildId: interaction.guildId
		}
	});

	let list = "";
	for (const element of elements) {
		list += `**${element.position} - ${element.requester}**\n`;
		list += `${element.request}\n\n`;
	}

	if (elements.length === 0) {
		list = "La file d'attente est vide pour l'instant";
	}

	return interaction.reply({
		embeds: [{
			title: "File d'attente",
			description: list,
			color: EpsibotColor.info
		}]
	});
}
