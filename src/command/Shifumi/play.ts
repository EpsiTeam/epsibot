import { ButtonStyle, ChatInputCommandInteraction, ComponentType, DiscordAPIError } from "discord.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { Logger } from "../../utils/logger/Logger.js";
import { saveScore } from "./save-score.js";
import { ShifumiChoice, ShifumiGame } from "./ShifumiGame.js";

export enum PlayParam {
	user = "user",
	turnsToWin = "nb_turns_to_win"
}

export async function play(interaction: ChatInputCommandInteraction<"cached">) {
	const user1 = interaction.member;
	const user2 = interaction.options.getMember(PlayParam.user);
	const turnsToWin =
		interaction.options.getNumber(PlayParam.turnsToWin, false) ?? 3;

	if (!user2) {
		return interaction.reply({
			embeds: [{
				description: "Joueur introuvable",
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	if (user1.id === user2.id) {
		return interaction.reply({
			embeds: [{
				description: "Impossible de jouer contre soi-même",
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	const logger =
		Logger.contextualize(interaction.guild, user1.user);
	logger.debug(`Started a shifumi game against ${user2.user.tag}`);

	const game = new ShifumiGame([user1, user2], turnsToWin);

	const title = `Shifumi, premier à ${turnsToWin} point${turnsToWin > 1 ? "s" : ""} gagne`;

	const message = await interaction.reply({
		embeds: [{
			title,
			description: game.getScore(),
			color: EpsibotColor.question
		}],
		components: [{
			type: ComponentType.ActionRow,
			components: [{
				type: ComponentType.Button,
				label: getShifumiEmoji(ShifumiChoice.rock) + " pierre",
				style: ButtonStyle.Secondary,
				customId: ShifumiChoice.rock
			}, {
				type: ComponentType.Button,
				label: getShifumiEmoji(ShifumiChoice.paper) + " feuille",
				style: ButtonStyle.Secondary,
				customId: ShifumiChoice.paper
			}, {
				type: ComponentType.Button,
				label: getShifumiEmoji(ShifumiChoice.scissors) + " ciseau",
				style: ButtonStyle.Secondary,
				customId: ShifumiChoice.scissors
			}]
		}],
		fetchReply: true
	});

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		filter:
			click => click.member.id === user1.id ||
			click.member.id === user2.id,
		idle: 60_000
	});

	collector.on("collect", async click => {
		try {
			await click.deferUpdate();

			// Shouldn't happen
			if (game.gameFinished()) return;

			game.play(click.member, click.customId as ShifumiChoice);

			if (game.turnFinished()) {
				await saveScore(interaction.guildId, game);
			}

			if (game.gameFinished()) {
				collector.stop();
			} else {
				await click.update({
					embeds: [{
						title,
						description: game.getScore(),
						color: EpsibotColor.question
					}]
				});
			}

		} catch (err) {
			if (err instanceof DiscordAPIError) {
				if (err.code === 10008) { // Message deleted
					logger.info("Can't update shifumi because message has been deleted");
				} else {
					logger.error(`Impossible to update shifumi: ${err.stack}`);
				}
			} else {
				logger.error(`Impossible to update shifumi with unknown error: ${err}`);
			}
		}
	});

	collector.on("end", async () => {
		let color = EpsibotColor.success;
		let waiting = "";
		if (!game.gameFinished()) {
			waiting = "\n__La partie est annulée, quelqu'un n'a pas répondu à temps__";
			color = EpsibotColor.warning;
		}

		try {
			await message.edit({
				embeds: [{
					title,
					description: game.getScore() + waiting,
					color: color
				}],
				components: []
			});
		} catch (err) {
			if (err instanceof DiscordAPIError) {
				if (err.code === 10008) { // Message deleted
					logger.info("Can't end shifumi because message has been deleted");
				} else {
					logger.error(`Impossible to end shifumi: ${err.stack}`);
				}
			} else {
				logger.error(`Impossible to update shifumi with unknown error: ${err}`);
			}
		}
	});

	return message;
}

export function getShifumiEmoji(str: ShifumiChoice) {
	switch (str) {
		case ShifumiChoice.rock:
			return "🗿";
		case ShifumiChoice.paper:
			return "📄";
		case ShifumiChoice.scissors:
			return "✂️";
	}
}
