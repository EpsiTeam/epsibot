import { ColorResolvable, CommandInteraction, User } from "discord.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";
import { Logger } from "../../utils/logger/Logger.js";
import { saveScore } from "./save-score.js";

export enum PlayParam {
	user = "user"
}

enum Shifumi {
	rock = "rock",
	paper = "paper",
	scissors = "scissors"
}

export async function play(interaction: CommandInteraction<"cached">) {
	const user1 = interaction.member.user;
	const user2 = interaction.options.getUser(PlayParam.user, true);

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
		Logger.contextualize(interaction.guild, user1);
	logger.debug(`Started a shifumi game against ${user2.tag}`);

	const description = `${user1} défie ${user2} à un shifumi !`;
	let answer1: Shifumi | null = null;
	let answer2: Shifumi | null = null;

	const message = await interaction.reply({
		embeds: [{
			description: description,
			color: EpsibotColor.question
		}],
		components: [{
			type: "ACTION_ROW",
			components: [{
				type: "BUTTON",
				label: getShifumiEmoji(Shifumi.rock) + " pierre",
				style: "SECONDARY",
				customId: Shifumi.rock
			}, {
				type: "BUTTON",
				label: getShifumiEmoji(Shifumi.paper) + " feuille",
				style: "SECONDARY",
				customId: Shifumi.paper
			}, {
				type: "BUTTON",
				label: getShifumiEmoji(Shifumi.scissors) + " ciseau",
				style: "SECONDARY",
				customId: Shifumi.scissors
			}]
		}],
		fetchReply: true
	});

	const collector = message.createMessageComponentCollector({
		componentType: "BUTTON",
		filter:
			click => click.member.id === user1.id ||
			click.member.id === user2.id,
		time: 60_000
	});

	collector.on("collect", async click => {
		// Shouldn't happen
		if (answer1 && answer2) return;

		let otherAnswer: Shifumi | null;
		let user: User;
		let otherUser: User;

		if (click.member.id === user1.id) {
			if (answer1) return;
			answer1 = click.customId as Shifumi;
			otherAnswer = answer2;
			user = user1;
			otherUser = user2;
		} else {
			if (answer2) return;
			answer2 = click.customId as Shifumi;
			otherAnswer = answer1;
			user = user2;
			otherUser = user1;
		}

		try {
			if (otherAnswer) {
				collector.stop();
				return click.deferUpdate();
			}

			return click.update({
				embeds: [{
					description: `${description}\n\n${user} a fait son choix, en attente de ${otherUser}`,
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
		let desc: string;
		let color: ColorResolvable;

		if (!answer1 && !answer2) {
			desc = `Ni ${user1} ni ${user2} n'a répondu !`;
			color = EpsibotColor.warning;
		} else if (!answer1 || !answer2) {
			const user = answer1 ? user2 : user1;
			desc = `${user} n'a pas répondu, pas de gagnant !`;
			color = EpsibotColor.warning;
		} else {
			const emoji1 = getShifumiEmoji(answer1);
			const emoji2 = getShifumiEmoji(answer2);
			desc = `${user1} a choisi ${emoji1}\n`;
			desc += `${user2} a choisi ${emoji2}\n\n`;

			if (answer1 === answer2) {
				desc += "Égalité !";
			} else if (
				(answer1 === Shifumi.rock && answer2 === Shifumi.scissors) ||
				(answer1 === Shifumi.paper && answer2 === Shifumi.rock) ||
				(answer1 === Shifumi.scissors && answer2 === Shifumi.paper)
			) {
				desc += `${emoji1} > ${emoji2}, ${user1} gagne !`;
			} else {
				desc += `${emoji2} > ${emoji1}, ${user2} gagne !`;
			}

			color = EpsibotColor.success;
		}

		try {
			await message.edit({
				embeds: [{
					description: `${description}\n\n${desc}`,
					color: color
				}],
				components: []
			});

			if (answer1 && answer2) {
				await saveScore();
			}
		} catch (err) {
			if (err.code === 10008) { // Message deleted
				logger.info("Can't end shifumi because message has been deleted");
			} else {
				logger.error(`Impossible to end shifumi: ${err.stack}`);
			}
		}
	});
}

function getShifumiEmoji(str: Shifumi) {
	switch (str) {
		case Shifumi.rock:
			return "🗿";
		case Shifumi.paper:
			return "📄";
		case Shifumi.scissors:
			return "✂️";
	}
}
