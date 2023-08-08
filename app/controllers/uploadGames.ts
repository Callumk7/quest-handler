import { NextFunction, Request, Response } from "express";
import { Artwork, IGDBGame, Job, QuestError, arrayIGDBGameSchema } from "../../types";
import { prisma } from "../../prisma/client";
import redis from "../../redis/client";

export const uploadGames = async (req: Request, res: Response, next: NextFunction) => {
	const processedGames = await uploadGameArray(req.games!);
	console.log(processedGames);
	next();
};

async function uploadGameArray(gameArray: IGDBGame[]) {
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
					releaseDate: game.first_release_date,
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

		await Promise.all(upsertGamePromises).then(() => console.log("uploaded games"));
	}
	return;
}

export const addGamesToCache = (req: Request, res: Response, next: NextFunction) => {
	next();
	// games can be added to the cache async
	const gameIdArray: number[] = [];
	for (const game of req.games!) {
		gameIdArray.push(game.id);
	}

	gameIdArray.forEach(async (gameId) => {
		redis.sadd("gameIds", gameId).then(() => console.log("updated cache"));
	});
};

export const createJobs = async (req: Request, res: Response, next: NextFunction) => {
	// for each game in req.games, we want to create jobs for artwork, storyline, genre

	const redisPromises = [];
	let promiseCount = 0;
	for (const game of req.games!) {
		if (game.storyline) {
			const job: Job = {
				id: Number(String(new Date().getTime()) + String(game.id) + String(0)),
				type: "storyline",
				payload: {
					gameId: game.id,
					storyline: game.storyline,
				},
			};

			const jobJson = JSON.stringify(job);
			redisPromises.push(redis.rpush("jobs", jobJson));
			promiseCount += 1;
		}
		if (game.aggregated_rating && game.aggregated_rating_count) {
			const job: Job = {
				id: Number(String(new Date().getTime()) + String(game.id) + String(1)),
				type: "rating",
				payload: {
					gameId: game.id,
					rating: {
						aggregated_rating: game.aggregated_rating,
						aggregated_rating_count: game.aggregated_rating_count,
					},
				},
			};

			const jobJson = JSON.stringify(job);
			redisPromises.push(redis.rpush("jobs", jobJson));
			promiseCount += 1;
		}
		if (game.genres) {
			const job: Job = {
				id: Number(String(new Date().getTime()) + String(game.id) + String(2)),
				type: "genre",
				payload: {
					gameId: game.id,
					genres: game.genres,
				},
			};

			const jobJson = JSON.stringify(job);
			redisPromises.push(redis.rpush("jobs", jobJson));
			promiseCount += 1;
		}
		const artworkPayload: Artwork[] = [];
		for (const artwork of game.artworks) {
			artworkPayload.push({ type: "artwork", image_id: artwork.image_id });
		}
		if (game.screenshots) {
			for (const screenshot of game.screenshots) {
				artworkPayload.push({
					type: "screenshot",
					image_id: screenshot.image_id,
				});
			}
		}
		const job: Job = {
			id: Number(String(new Date().getTime()) + String(game.id) + String(3)),
			type: "artwork",
			payload: {
				gameId: game.id,
				artwork: artworkPayload,
			},
		};
		const jobJson = JSON.stringify(job);
		redisPromises.push(redis.rpush("jobs", jobJson));
		promiseCount += 1;

		console.log(`Promises created: ${promiseCount}`);
	}
	Promise.all(redisPromises).then(() => console.log("jobs added to queue"));
	next();
};
