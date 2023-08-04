/* import { IGDBGame } from "../../types";

async function POST(req: NextRequest) {
	const headersList = headers();
	const handoffType = headersList.get("handoffType");
	console.log(`type: ${handoffType} received...`);

	try {
		const requestBodyJson: unknown = await req.json();
		const game = IGDBGameSchema.parse(requestBodyJson);
		const job = {
			id: new Date().toTimeString() + game.id.toString(),
			type: handoffType,
			payload: game,
		};

		const jobJson = JSON.stringify(job);

		await redis.rpush("job", jobJson);

		return new NextResponse("OK", { status: 200 });
	} catch (err) {
		console.error("an error occurred on worker route", err);
		throw err;
	}
}

const createJob = (type: string, payload: IGDBGame) => {
	const job = {
		id: new Date().getTime() + payload.id.toString(),
		type,
		payload,
	};

	return job;
}; */

import { NextFunction, Request, Response, Router } from "express";
import { logTime } from "../middleware/middleware";
import { checkForBody, validateBody } from "../middleware/validation";
import { checkGameCache } from "../middleware/cache";
import { addGamesToCache, uploadGames } from "../controllers/uploadGames";

export const jobsRouter = Router();

const jobsEntryHandler = (req: Request, res: Response, next: NextFunction) => {
	console.log("Jobs route reached");
	next();
};

// const jobsRouteHandlerArray = [jobValidator, addJobToQueue]

jobsRouter.use("/", jobsEntryHandler);
