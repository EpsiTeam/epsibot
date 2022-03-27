import { CommandInteraction, MessagePayload } from "discord.js";
import { getRepository } from "typeorm";
import { CustomEmbedCommand } from "../../entity/CustomEmbedCommand.js";
import { Logger } from "../../utils/logger/Logger.js";

export async function list(interaction: CommandInteraction<"cached">) {
	const logger =
		Logger.contextualize(interaction.guild, interaction.member.user);
	const commands = await getRepository(CustomEmbedCommand).find();
	if (commands.length === 0) {
		return interaction.reply({
			embeds: [{
				description: "Il n'y a aucune commande embed custom sur ce serveur\n`/embed_command add` permet de créer une nouvelle commande embed custom",
				color: "YELLOW"
			}]
		});
	}

	enum ButtonAction {
		previous = "previous",
		next = "next"
	}

	const message = await interaction.deferReply({
		fetchReply: true
	});

	let currentIndex = 0;

	const showList = (index: number) => {
		return new MessagePayload(interaction, {
			embeds: [{
				title: "Liste des commandes custom",
				description: `Commande \`${commands[index].name}\``,
				fields: [{
					name: "Pour admins:",
					value: commands[index].adminOnly ? "Oui" : "Non",
					inline: true
				}, {
					name: "Auto delete:",
					value: commands[index].autoDelete ? "Oui" : "Non",
					inline: true
				}],
				footer: {
					text: `Commande ${index + 1}/${commands.length}`
				}
			},
			commands[index].createEmbed()
			],
			components: [{
				type: "ACTION_ROW",
				components: [{
					type: "BUTTON",
					label: "<",
					style: "SECONDARY",
					customId: ButtonAction.previous,
					disabled: commands.length === 0
				}, {
					type: "BUTTON",
					label: ">",
					style: "SECONDARY",
					customId: ButtonAction.next,
					disabled: commands.length === 0
				}]
			}]
		});
	};

	const collector = message.createMessageComponentCollector({
		idle: 60_000,
		componentType: "BUTTON"
	});

	collector.on("collect", async click => {
		if (click.customId === ButtonAction.next) {
			currentIndex++;
			if (currentIndex >= commands.length) currentIndex = 0;
		}
		if (click.customId === ButtonAction.previous) {
			currentIndex--;
			if (currentIndex < 0) currentIndex = commands.length - 1;
		}

		try {
			await click.update(showList(currentIndex));
		} catch (err) {
			if (err.code === 10008) {
				logger.info("Can't update list because message has been deleted");
			} else {
				logger.warn(`Impossible to update list: ${err.stack}`);
			}
		}
	});

	collector.on("end", async () => {
		try {
			await interaction.editReply({
				components: []
			});
		} catch (err) {
			if (err.code === 10008) {
				logger.info("Can't end list because message has been deleted");
			} else {
				logger.warn(`Impossible to end collector: ${err.stack}`);
			}
		}
	});

	await interaction.editReply(showList(currentIndex));
}
