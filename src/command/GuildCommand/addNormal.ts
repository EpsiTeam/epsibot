import { Collection, CommandInteraction, Message } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { Logger } from "../../utils/logger/Logger.js";
import { timeoutEmbed, helpArgument, commandFields } from "./helper.js";

export async function addNormal(
	interaction: CommandInteraction<"cached">,
	name: string,
	adminOnly: boolean,
	autoDelete: boolean
) {
	if (!interaction.channel) {
		throw Error("Channel doesn't exist");
	}

	await interaction.followUp({
		embeds: [
			{
				description: `Quel sera la réponse affiché par la commande \`${name}\` ?${helpArgument}`,
				color: EpsibotColor.question
			}
		],
		ephemeral: false
	});

	let answer: Collection<string, Message<boolean>>;

	try {
		answer = await interaction.channel.awaitMessages({
			filter: (msg) => msg.author.id === interaction.member.id,
			max: 1,
			time: 60_000,
			errors: ["time"]
		});
	} catch (err) {
		return interaction.followUp(timeoutEmbed(name));
	}

	const msgAnswer = answer.first();
	if (!msgAnswer) {
		throw Error("Collector returned with empty collection");
	}
	const response = msgAnswer.content;
	Logger.debug(response);
	if (
		response.length == 0 ||
		response.length > CustomCommand.maxResponseLength
	) {
		await msgAnswer.react("❌");
		return interaction.followUp({
			embeds: [
				{
					title: `Création de la commande \`${name}\` annulée`,
					description: `La réponse choisie a une taille de ${response.length}, la taille doit être entre 1 et ${CustomCommand.maxResponseLength} caractères`,
					color: EpsibotColor.error
				}
			],
			ephemeral: false
		});
	}
	await msgAnswer.react("✅");

	const [command] = await Promise.all([
		DBConnection.getRepository(CustomCommand).save(
			new CustomCommand(
				interaction.guildId,
				name,
				response,
				adminOnly,
				autoDelete
			)
		),
		DBConnection.getRepository(CustomEmbedCommand).delete({
			guildId: interaction.guildId,
			name
		})
	]);

	return interaction.followUp({
		embeds: [
			{
				title: `Commande \`${command.name}\` créée, elle répondra:`,
				description: command.response,
				fields: commandFields(command),
				color: EpsibotColor.success
			}
		],
		ephemeral: false
	});
}
