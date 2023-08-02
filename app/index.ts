import express from "express";
import "dotenv/config";
import { gamesRouter } from "./routes/games";
import { logTime } from "./middleware/middleware";
import responseTime from "response-time";
import prisma from "../prisma/client";
import redis from "../redis/client";

// redis init
// we are pumping our existing game ids into a redis cache
// layer so we can avoid expensive upsert work where
// we don't need it
const getGameIds = async () => {
	const getGames = await prisma.game.findMany({
		select: {
			gameId: true,
		},
	});

	const gameIdArray: number[] = [];
	for (const game of getGames) {
		gameIdArray.push(game.gameId);
	}

	gameIdArray.forEach(async (gameId) => {
		await redis.sadd("gameIds", gameId);
	});
};

getGameIds();

// express server
const port = process.env.PORT;

const app = express();
app.use(responseTime());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Please use correct endpoint for data");
});

app.use((req, res, next) => {
	console.log(`Request type: ${req.method}`);
	next();
});

app.use(logTime);

// routers
app.use("/games", gamesRouter);

app.listen(port, () => {
	console.log(`listenening on port ${port}`);
});
