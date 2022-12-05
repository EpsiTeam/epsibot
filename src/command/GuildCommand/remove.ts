import { ChatInputCommandInteraction } from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { confirm } from "../../util/confirm/confirm.js";

export enum RemoveParam {
	name = "name"
}

export async function remove(
	interaction: ChatInputCommandInteraction<"cached">
) {
	const name = interaction.options.getString(RemoveParam.name, true);

	const [command, embedCommand] = await Promise.all([
		DBConnection.getRepository(CustomCommand).findOneBy({
			guildId: interaction.guildId,
			name
		}),
		DBConnection.getRepository(CustomEmbedCommand).findOneBy({
			guildId: interaction.guildId,
			name
		})
	]);

	if (!command && !embedCommand) {
		return interaction.reply({
			embeds: [
				{
					description: `Commande custom \`${name}\` inexistente, impossible de la supprimer`,
					color: EpsibotColor.error
				}
			],
			ephemeral: true
		});
	}

	if (embedCommand) {
		await interaction.reply({
			embeds: [
				{
					title: `Commande \`${embedCommand.name}\`:`,
					color: EpsibotColor.info
				},
				embedCommand.createEmbed()
			],
			ephemeral: true
		});
	} else if (command) {
		await interaction.reply({
			embeds: [
				{
					title: `Commande \`${command.name}\`:`,
					description: command.response,
					color: EpsibotColor.info
				}
			],
			ephemeral: true
		});
	}

	const { answer: confirmDelete } = await confirm(interaction, {
		description: `Confirmer la suppression de la commande \`${name}\``,
		labelYes: "Ok",
		labelNo: "Annuler"
	});

	if (!confirmDelete) return;

	if (command)
		await DBConnection.getRepository(CustomCommand).remove(command);
	if (embedCommand)
		await DBConnection.getRepository(CustomEmbedCommand).remove(
			embedCommand
		);

	return interaction.followUp({
		embeds: [
			{
				description: `Commande custom \`${name}\` supprimée`,
				color: EpsibotColor.success
			}
		],
		ephemeral: true
	});
}
