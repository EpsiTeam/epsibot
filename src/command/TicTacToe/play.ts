import { CommandInteraction } from "discord.js";
import { Logger } from "../../utils/logger/Logger.js";
import { TicTacToeGame } from "./TicTacToeGame.js";
import { confirm } from "../../utils/confirm/confirm.js";
import { EpsibotColor } from "../../utils/color/EpsibotColor.js";

export enum PlayParam {
	user = "user"
}

export async function play(interaction: CommandInteraction<"cached">) {
	const user1 = interaction.options.getUser(PlayParam.user, true);
	const user2 = interaction.member.user;

	const logger =
		Logger.contextualize(interaction.guild, interaction.member.user);

	if (user1.id === user2.id) {
		return interaction.reply({
			embeds: [{
				description: "Impossible de jouer contre soi-même",
				color: EpsibotColor.error
			}],
			ephemeral: true
		});
	}

	const accepted = await confirm(interaction, {
		description: `${user2} défie ${user1} à une partie de morpion\nEst-ce que ${user1} accepte le challenge ?`,
		userId: user1.id,
		returnOnTimout: false,
		ephemeral: false
	});

	if (!accepted) return;

	logger.debug(`Started a TicTacToe game against ${user1.tag}`);

	const game = new TicTacToeGame(user1, user2);
	const firstPlayer = game.getPlayerTurn();

	const gameMessage = await interaction.followUp({
		embeds: [{
			description: `La partie démarre, c'est ${firstPlayer} qui joue en premier car c'est lui qui a été défié`,
			color: game.getPlayerColor(firstPlayer)
		}],
		components: game.getComponents(false)
	});

	let firstTurn = true;

	while (!game.isFinished()) {
		const player = game.getPlayerTurn();

		if (!firstTurn) {
			await gameMessage.edit({
				embeds: [{
					description: `Au tour de ${player} de jouer`,
					color: game.getPlayerColor(player)
				}],
				components: game.getComponents(false)
			});
		} else {
			firstTurn = false;
		}

		const click = await gameMessage.awaitMessageComponent({
			componentType: "BUTTON",
			filter: (click) => click.member.id === player.id,
			time: 60_000
		});
		await click.deferUpdate();

		const [x, y] = click.customId.split("/");

		try {
			game.play(parseInt(x, 10), parseInt(y, 10));
		} catch (err) {
			logger.error(`Something went wrong with TicTacToeGame: ${err.stack}`);
			return gameMessage.edit({
				embeds: [{
					description: `Désolé, il y a eu une erreur avec la partie, considérons que c'est un match nul entre ${user1} et ${user2}`,
					color: EpsibotColor.error
				}],
				components: []
			});
		}
	}

	const winner = game.winner;
	const result = winner ? `${winner} remporte la partie !` :  "C'est un match nul !";

	return gameMessage.edit({
		embeds: [{
			description: `Résultat de la partie de morpion entre ${user1} et ${user2}:\n${result}`,
			color: winner ? game.getPlayerColor(winner) : EpsibotColor.warning
		}],
		components: game.getComponents(true)
	});
}
