import { NextFunction, Request, Response } from "express";
import { IGDBGame, QuestError, arrayIGDBGameSchema } from "../../types";
import { prisma } from "../../prisma/client";
import redis from "../../redis/client";

export const uploadGames = async (req: Request, res: Response, next: NextFunction) => {
	const processedGames = await uploadGameArray(req.games!);
	console.log(processedGames);
	next();
};

async function uploadGameArray(gameArray: IGDBGame[]): Promise<{ gameId: number }[]> {
	let processedGameCount = 0;

	if (gameArray) {
		const upsertGamePromises = [];
		for (const game of gameArray) {
			const upsertGamePromise = prisma.game.upsert({
				where: {
					gameId: game.id,
				},
				update: {},
				create: {
					gameId: game.id,
					title: game.name,
					cover: {
						create: {
							imageId: game.cover.image_id,
						},
					},
				},
				select: {
					gameId: true,
				},
			});
			processedGameCount += 1;
			upsertGamePromises.push(upsertGamePromise);
			console.log(`promise primed for ${game.name}`);
			console.log(`processed ${processedGameCount} promises`);
		}

		const processedGames = await Promise.all(upsertGamePromises);
		processedGames.forEach((game) => console.log(game));
		return processedGames;
	}
	return [];
}

export const addGamesToCache = (req: Request, res: Response, next: NextFunction) => {
	const gameIdArray: number[] = [];
	for (const game of req.games!) {
		gameIdArray.push(game.id);
	}

	gameIdArray.forEach(async (gameId) => {
		await redis.sadd("gameIds", gameId);
	});
	console.log("updated cache");
	next();
};
