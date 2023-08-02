import { NextFunction, Request, Response } from "express";
import { IGDBGame } from "../../types";
import redis from "../../redis/client";

/** this function checks the redis cache to see if the game id already exists in the database,
if so, we can handle reducing the work accordingly.. */
export const checkGameCache = async (req: Request, res: Response, next: NextFunction) => {
	// we know that we have games at this point in the middleware stack
	const gameIds = extractGameIds(req.games!);
	const idsInCache: number[] = [];

	const checkPromises = gameIds.map(async (id) => {
		const exists = await checkGameidInCache(id);
		if (exists) {
			console.log("cache HIT");
			idsInCache.push(id);
		}
	});

	await Promise.all(checkPromises);

	const gamesToProcess = req.games!.filter((game) => !idsInCache.includes(game.id));
	if (gamesToProcess.length === 0) {
		console.log("no games to process");
		return;
	} else {
		req.games = gamesToProcess;
		next();
	}
};

const extractGameIds = (payload: IGDBGame[]): number[] => {
	const gameIds: number[] = [];
	for (const game of payload) {
		gameIds.push(game.id);
	}

	return gameIds;
};

const checkGameidInCache = async (gameId: number) => {
	const result = await redis.sismember("gameIds", gameId); // 1 if exists, else 0

	return result === 1;
};
