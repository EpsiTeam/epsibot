import {
	ActionRowData,
	APIEmbed,
	ButtonStyle,
	CommandInteraction,
	ComponentType,
	DiscordAPIError,
	MessageActionRowComponentData,
	MessageEditOptions
} from "discord.js";
import { DBConnection } from "../../DBConnection.js";
import { CustomCommand } from "../../entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { Logger } from "../../utils/logger/Logger.js";
import { commandFields } from "./helper.js";

enum ButtonAction {
	previous = "previous",
	next = "next"
}

export async function list(interaction: CommandInteraction<"cached">) {
	const logger = Logger.contextualize(
		interaction.guild,
		interaction.member.user
	);

	const message = await interaction.reply({
		embeds: [
			{
				description: "Construction de la liste en cours...",
				color: EpsibotColor.info
			}
		],
		fetchReply: true
	});

	const [normalCommands, embedCommands] = await Promise.all([
		DBConnection.getRepository(CustomCommand).find({
			where: { guildId: interaction.guildId }
		}),
		DBConnection.getRepository(CustomEmbedCommand).find({
			where: { guildId: interaction.guildId }
		})
	]);

	// Typescript shenanigan to correctly type commands
	const commands = (<(CustomCommand | CustomEmbedCommand)[]>(
		normalCommands
	)).concat(embedCommands);

	// const commands = await getRepository(CustomCommand).find();
	if (commands.length === 0) {
		return message.edit({
			embeds: [
				{
					description:
						"Il n'y a aucune commande custom sur ce serveur\n`/command add` permet de créer une nouvelle commande custom",
					color: EpsibotColor.warning
				}
			]
		});
	}

	let currentIndex = 0;

	const showList = (index: number): MessageEditOptions => {
		const command = commands[index];

		const navigationButtons: ActionRowData<MessageActionRowComponentData> =
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						label: "<",
						style: ButtonStyle.Secondary,
						customId: ButtonAction.previous,
						disabled: commands.length <= 1
					},
					{
						type: ComponentType.Button,
						label: ">",
						style: ButtonStyle.Secondary,
						customId: ButtonAction.next,
						disabled: commands.length <= 1
					}
				]
			};

		let embedCommand: APIEmbed;

		if (command instanceof CustomCommand) {
			embedCommand = {
				description: command.response
			};
		} else {
			embedCommand = command.createEmbed();
		}

		return {
			embeds: [
				{
					title: `Liste des commandes custom, commande \`${command.name}\``,
					fields: commandFields(command),
					footer: {
						text: `Commande ${index + 1}/${commands.length}`
					},
					color: EpsibotColor.info
				},
				embedCommand
			],
			components: [navigationButtons]
		};
	};

	const collector = message.createMessageComponentCollector({
		idle: 60_000,
		componentType: ComponentType.Button
	});

	collector.on("collect", async (click) => {
		if (click.customId === ButtonAction.next) {
			currentIndex++;
			if (currentIndex >= commands.length) currentIndex = 0;
		}
		if (click.customId === ButtonAction.previous) {
			currentIndex--;
			if (currentIndex < 0) currentIndex = commands.length - 1;
		}

		try {
			await click.deferUpdate();
			await message.edit(showList(currentIndex));
		} catch (err) {
			if (err instanceof DiscordAPIError) {
				if (err.code === 10008) {
					// Message deleted
					logger.info(
						"Can't update list because message has been deleted"
					);
				} else {
					logger.error(`Impossible to update list: ${err.stack}`);
				}
			} else {
				logger.error(
					`Impossible to update list with unknown error: ${err}`
				);
			}
		}
	});

	collector.on("end", async () => {
		try {
			await message.edit({
				components: []
			});
		} catch (err) {
			if (err instanceof DiscordAPIError) {
				if (err.code === 10008) {
					// Message deleted
					logger.info(
						"Can't end list because message has been deleted"
					);
				} else {
					logger.error(`Impossible to end collector: ${err.stack}`);
				}
			} else {
				logger.error(
					`Impossible to end collector with unknown error: ${err}`
				);
			}
		}
	});

	return message.edit(showList(currentIndex));
}
