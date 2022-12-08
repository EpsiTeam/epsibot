import {
	ActionRowData,
	APIEmbed,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	MessageActionRowComponentData,
	MessageEditOptions
} from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { CustomCommand } from "../../database/entity/CustomCommand.js";
import { CustomEmbedCommand } from "../../database/entity/CustomEmbedCommand.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { commandFields } from "./help.js";

enum ButtonAction {
	previous = "previous",
	next = "next"
}

export async function list(interaction: ChatInputCommandInteraction<"cached">) {
	const message = await interaction.reply({
		embeds: [
			{
				description: "Construction de la liste en cours...",
				color: EpsibotColor.info
			}
		],
		fetchReply: true,
		ephemeral: true
	});

	const [normalCommands, embedCommands] = await Promise.all([
		DBConnection.getRepository(CustomCommand).findBy({
			guildId: interaction.guildId
		}),
		DBConnection.getRepository(CustomEmbedCommand).findBy({
			guildId: interaction.guildId
		})
	]);

	// Typescript shenanigan to correctly type commands
	const commands = (<(CustomCommand | CustomEmbedCommand)[]>(
		normalCommands
	)).concat(embedCommands);

	if (commands.length === 0) {
		return interaction.webhook
			.editMessage(message, {
				embeds: [
					{
						description:
							"Il n'y a aucune commande custom sur ce serveur\n`/command add` permet de créer une nouvelle commande custom",
						color: EpsibotColor.warning
					}
				]
			})
			.catch(() => undefined);
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

		await click.deferUpdate();
		await interaction.webhook
			.editMessage(message, showList(currentIndex))
			.catch(() => undefined);
	});

	collector.on("end", async () => {
		await interaction.webhook
			.editMessage(message, { components: [] })
			.catch(() => undefined);
	});

	return interaction.webhook
		.editMessage(message, showList(currentIndex))
		.catch(() => undefined);
}
