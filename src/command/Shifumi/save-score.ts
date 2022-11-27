import { DBConnection } from "../../DBConnection.js";
import { ShifumiScore } from "../../entity/ShifumiScore.js";
import { ShifumiGame } from "./ShifumiGame.js";

export async function saveScore(guildId: string, game: ShifumiGame) {
	const [player1, player2] = game.getPlayers();
	const winner = game.getTurnWinner();

	if (winner === null) {
		return Promise.all([
			updateOne(guildId, player1.id, "draw"),
			updateOne(guildId, player2.id, "draw")
		]);
	}

	if (winner.id === player1.id) {
		return Promise.all([
			updateOne(guildId, player1.id, "win"),
			updateOne(guildId, player2.id, "lose")
		]);
	}

	if (winner.id === player2.id) {
		return Promise.all([
			updateOne(guildId, player1.id, "lose"),
			updateOne(guildId, player2.id, "win")
		]);
	}

	throw Error("Don't know who win this shifumi game, can't save score");
}

async function updateOne(
	guildId: string,
	userId: string,
	type: "win" | "lose" | "draw"
) {
	const repo = DBConnection.getRepository(ShifumiScore);

	const existing = await repo.findOne({
		where: {
			guildId,
			userId
		}
	});

	if (!existing) {
		const win = type === "win" ? 1 : 0;
		const lose = type === "lose" ? 1 : 0;
		const draw = type === "draw" ? 1 : 0;

		return repo.save(new ShifumiScore(guildId, userId, win, lose, draw));
	}

	return repo.increment(
		{
			guildId,
			userId
		},
		type,
		1
	);
}
