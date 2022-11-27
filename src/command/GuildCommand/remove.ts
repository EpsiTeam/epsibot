import { ChatInputCommandInteraction } from "discord.js";
import { DBConnection } from "../../DBConnection.js";
import { CustomCommand } from "../../entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { confirm } from "../../utils/confirm/confirm.js";

export enum RemoveParam {
	name = "name"
}

export async function remove(interaction: ChatInputCommandInteraction<"cached">) {
	const name = interaction.options.getString(RemoveParam.name, true);

	const [command, embedCommand] = await Promise.all([
		DBConnection.getRepository(CustomCommand).findOne({
			where: {
				guildId: interaction.guildId,
				name
			}
		}),
		DBConnection.getRepository(CustomEmbedCommand).findOne({
			where: {
				guildId: interaction.guildId,
				name
			}
		})
	]);

	if (!command && !embedCommand) {
		return interaction.reply({
			embeds: [{
				description: `Commande custom \`${name}\` inexistente, impossible de la supprimer`,
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	if (embedCommand) {
		await interaction.reply({
			embeds: [{
				title: `Commande \`${embedCommand.name}\`:`,
				color: EpsibotColor.info
			}, embedCommand.createEmbed()],
			ephemeral: true
		});
	} else if (command) {
		await interaction.reply({
			embeds: [{
				title: `Commande \`${command.name}\`:`,
				description: command.response,
				color: EpsibotColor.info
			}],
			ephemeral: true
		});
	}

	const confirmDelete = await confirm(interaction, {
		description: `Confirmer la suppression de la commande \`${name}\``,
		labelYes: "Ok",
		labelNo: "Annuler",
		returnOnTimout: false
	});

	if (!confirmDelete) return;

	if (command)
		await DBConnection.getRepository(CustomCommand).remove(command);
	if (embedCommand)
		await DBConnection.getRepository(CustomEmbedCommand)
			.remove(embedCommand);

	return interaction.followUp({
		embeds: [{
			description: `Commande custom \`${name}\` supprimée`,
			color: EpsibotColor.success
		}],
		ephemeral: true
	});
}
