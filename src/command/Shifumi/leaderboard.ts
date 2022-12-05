/* eslint-disable no-irregular-whitespace */
import {
	ButtonStyle,
	CommandInteraction,
	ComponentType,
	DiscordAPIError,
	GuildMember,
	MessageEditOptions
} from "discord.js";
import { DBConnection } from "../../database/DBConnection.js";
import { ShifumiScore } from "../../database/entity/ShifumiScore.js";
import { EpsibotColor } from "../../util/color/EpsibotColor.js";
import { Logger } from "../../util/Logger.js";

enum ButtonAction {
	previous = "previous",
	next = "next"
}

export async function leaderboard(interaction: CommandInteraction<"cached">) {
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

	const allScores = await DBConnection.getRepository(ShifumiScore).find({
		where: { guildId: interaction.guildId },
		order: {
			win: "DESC",
			lose: "ASC",
			draw: "ASC"
		}
	});

	if (allScores.length === 0) {
		return message
			.edit({
				embeds: [
					{
						description:
							"Il n'y a aucun score de shifumi sur ce serveur\n`/shifumi play` permet de jouer, les scores sont enregistrés automatiquement",
						color: EpsibotColor.warning
					}
				]
			})
			.catch(() => undefined);
	}

	// Splitting the scores into sub arrays,
	// we want to display more than one at a time
	const subscores: ShifumiScore[][] = [];
	while (allScores.length > 0) {
		subscores.push(allScores.splice(0, 5));
	}

	let currentIndex = 0;

	const showList = async (index: number): Promise<MessageEditOptions> => {
		const scores = subscores[index];
		const playerScores = await Promise.all(
			scores.map(async (score) => {
				let member: GuildMember;
				let user: string;

				try {
					member = await interaction.guild.members.fetch(
						score.userId
					);
					user = `${member} (${member.user.tag}):`;
				} catch (err) {
					// member does not exists
					user = "(Ancien membre):";
				}

				let scoreText = `${user}\n`;
				scoreText += `　　Tours gagnés: ${score.win}\n`;
				scoreText += `　　Tours égalés: ${score.draw}\n`;
				scoreText += `　　Tours perdus: ${score.lose}`;

				return scoreText;
			})
		);
		const text = playerScores.join("\n\n");

		return {
			embeds: [
				{
					title: "Leaderboard du shifumi",
					description: text,
					footer: {
						text: `Page ${index + 1}/${subscores.length}`
					},
					color: EpsibotColor.info
				}
			],
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: "<",
							style: ButtonStyle.Secondary,
							customId: ButtonAction.previous,
							disabled: subscores.length <= 1
						},
						{
							type: ComponentType.Button,
							label: ">",
							style: ButtonStyle.Secondary,
							customId: ButtonAction.next,
							disabled: subscores.length <= 1
						}
					]
				}
			]
		};
	};

	const collector = message.createMessageComponentCollector({
		idle: 60_000,
		componentType: ComponentType.Button
	});

	collector.on("collect", async (click) => {
		if (click.customId === ButtonAction.next) {
			currentIndex++;
			if (currentIndex >= subscores.length) currentIndex = 0;
		}
		if (click.customId === ButtonAction.previous) {
			currentIndex--;
			if (currentIndex < 0) currentIndex = subscores.length - 1;
		}

		await click.deferUpdate();
		await message.edit(await showList(currentIndex)).catch(() => undefined);
	});

	collector.on("end", async () => {
		await message
			.edit({
				components: []
			})
			.catch(() => undefined);
	});

	return message.edit(await showList(currentIndex)).catch(() => undefined);
}
