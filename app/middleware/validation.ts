import { NextFunction, Request, Response } from "express";
import { IGDBGame, QuestError, arrayIGDBGameSchema } from "../../types";

export const checkForBody = (req: Request, res: Response, next: NextFunction) => {
	const body = req.body;

	if (Object.keys(body).length === 0) {
		console.log("no body found");
		res.sendStatus(401);
	} else {
		console.log("body found");
		next();
	}
};

export const validateBody = (req: Request, res: Response, next: NextFunction) => {
	const body: unknown = req.body;
	try {
		const gamesArray = validateIGDBGames(body);

		// this is type safe
		req.games = gamesArray;

		console.log("body validated");
		// respond to frontline server, request is captured
		res.send("request receievd");

		// proceed with processing...
		next();
	} catch (err) {
		console.error("something went wrong", err);
		res.statusMessage = "body is not of correct IGDB format";
		res.sendStatus(400);
	}
};

const validateIGDBGames = (body: unknown): IGDBGame[] => {
	try {
		const gamesArray = arrayIGDBGameSchema.parse(body);
		return gamesArray;
	} catch (err) {
		console.error("something went wrong", err);
		throw new QuestError("something went wrong", "validateBody");
	}
};
