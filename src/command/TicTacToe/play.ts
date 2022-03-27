import { CommandInteraction, ButtonInteraction } from "discord.js";
import { Logger } from "../../utils/logger/Logger.js";
import { TicTacToeGame } from "./TicTacToeGame.js";

export enum PlayParam {
	user = "user"
}

enum ButtonAction {
	yes = "yes",
	no = "no"
}

export async function play(interaction: CommandInteraction<"cached">) {
	const user1 = interaction.options.getUser(PlayParam.user, true);
	const user2 = interaction.member.user;

	const logger =
		Logger.contextualize(interaction.guild, interaction.member.user);

	if (user1.id === user2.id) {
		return interaction.reply({
			embeds: [{
				title: "Partie impossible",
				description: "Vous ne pouvez pas jouer contre vous-même !",
				color: "RED"
			}],
			ephemeral: true
		});
	}

	const message = await interaction.deferReply({ fetchReply: true });

	const promiseConfirm = message.awaitMessageComponent({
		componentType: "BUTTON",
		filter: (click) => click.member.id === user1.id,
		time: 60_000
	});

	await interaction.editReply({
		embeds: [{
			title: "Partie de morpion",
			description: `${user2} défie ${user1} à une partie de morpion\n${user1}, est-ce que tu acceptes le challenge ?`
		}],
		components: [{
			type: "ACTION_ROW",
			components: [{
				type: "BUTTON",
				style: "SUCCESS",
				label: "Oui",
				customId: ButtonAction.yes
			}, {
				type: "BUTTON",
				style: "DANGER",
				label: "Non",
				customId: ButtonAction.no
			}]
		}]
	});

	let confirm: ButtonInteraction;
	try {
		confirm = await promiseConfirm;
	} catch (err) {
		return interaction.editReply({
			embeds: [{
				title: "Partie refusée",
				description: `Désolé ${user2}, mais ${user1} n'a pas répondu`,
				color: "RED"
			}],
			components: []
		});
	}

	if (confirm.customId === ButtonAction.no) {
		return confirm.update({
			embeds: [{
				title: "Partie refusée",
				description: `Désolé ${user2}, mais ${user1} a refusé de jouer contre toi !`,
				color: "RED"
			}],
			components: []
		});
	}

	logger.debug(`Started a TicTacToe game against ${user1.tag}`);

	const game = new TicTacToeGame(user1, user2);
	let click = confirm;

	while (!game.isFinished()) {
		const player = game.getPlayerTurn();

		const promisePlay = message.awaitMessageComponent({
			componentType: "BUTTON",
			filter: (click) => click.member.id === player.id,
			time: 60_000
		});

		await click.update({
			embeds: [{
				title: "Partie de morpion",
				description: `Au tour de ${player} de jouer !`,
				color: game.getPlayerColor(player)
			}],
			components: game.getComponents(false)
		});

		click = await promisePlay;

		const [x, y] = click.customId.split("/");

		try {
			game.play(parseInt(x, 10), parseInt(y, 10));
		} catch (err) {
			return click.update({
				embeds: [{
					title: "Erreur dans la partie",
					description: `Désolé, il y a eu une erreur avec la partie, considérons que c'est un match nul entre ${user1} et ${user2} !`,
					color: "RED"
				}],
				components: []
			});
		}
	}

	const winner = game.winner;
	const result = winner ? `${winner} remporte la partie !` :  "C'est un match nul !";

	return click.update({
		embeds: [{
			title: "Partie terminée",
			description: `Résultat de la partie entre ${user1} et ${user2}:\n${result}`,
			color: winner ? game.getPlayerColor(winner) : "YELLOW"
		}],
		components: game.getComponents(true)
	});
}
