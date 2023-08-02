import { NextFunction, Request, Response, Router } from "express";
import { logTime } from "../middleware/middleware";
import { checkForBody, validateBody } from "../middleware/validation";
import { checkGameCache } from "../middleware/cache";
import { addGamesToCache, uploadGames } from "../controllers/uploadGames";

export const gamesRouter = Router();

const postGamesHandler = (req: Request, res: Response, next: NextFunction) => {
	console.log("post games handler reached");
	next();
};

const handlerArray = [
	postGamesHandler,
	checkForBody,
	validateBody,
	checkGameCache,
	uploadGames,
	addGamesToCache,
];

gamesRouter.post("/", handlerArray);
gamesRouter.use("/", logTime);
