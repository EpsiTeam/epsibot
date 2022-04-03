import { CommandInteraction } from "discord.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { Logger } from "../../utils/logger/Logger.js";
import { saveScore } from "./save-score.js";
import { ShifumiChoice, ShifumiGame } from "./ShifumiGame.js";

export enum PlayParam {
	user = "user",
	turnsToWin = "nb_turns_to_win"
}

export async function play(interaction: CommandInteraction<"cached">) {
	const user1 = interaction.member;
	const user2 = interaction.options.getMember(PlayParam.user, true);
	const turnsToWin =
		interaction.options.getNumber(PlayParam.turnsToWin, false) ?? 3;

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
			type: "ACTION_ROW",
			components: [{
				type: "BUTTON",
				label: getShifumiEmoji(ShifumiChoice.rock) + " pierre",
				style: "SECONDARY",
				customId: ShifumiChoice.rock
			}, {
				type: "BUTTON",
				label: getShifumiEmoji(ShifumiChoice.paper) + " feuille",
				style: "SECONDARY",
				customId: ShifumiChoice.paper
			}, {
				type: "BUTTON",
				label: getShifumiEmoji(ShifumiChoice.scissors) + " ciseau",
				style: "SECONDARY",
				customId: ShifumiChoice.scissors
			}]
		}],
		fetchReply: true
	});

	const collector = message.createMessageComponentCollector({
		componentType: "BUTTON",
		filter:
			click => click.member.id === user1.id ||
			click.member.id === user2.id,
		idle: 60_000
	});

	collector.on("collect", async click => {
		// Shouldn't happen
		if (game.gameFinished()) return;

		game.play(click.member, click.customId as ShifumiChoice);

		try {
			if (game.turnFinished()) {
				await saveScore(interaction.guildId, game);
			}

			if (game.gameFinished()) {
				collector.stop();
				return click.deferUpdate();
			}

			return click.update({
				embeds: [{
					title,
					description: game.getScore(),
					color: EpsibotColor.question
				}]
			});
		} catch (err) {
			if (err.code === 10008) { // Message deleted
				logger.info("Can't update shifumi because message has been deleted");
			} else {
				logger.error(`Impossible to update shifumi: ${err.stack}`);
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
			if (err.code === 10008) { // Message deleted
				logger.info("Can't end shifumi because message has been deleted");
			} else {
				logger.error(`Impossible to end shifumi: ${err.stack}`);
			}
		}
	});
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
