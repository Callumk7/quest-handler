import express from "express";
import "dotenv/config";
import { gamesRouter } from "./routes/games";
import { logTime } from "./middleware/middleware";

// express server
const port = process.env.PORT;

const app = express();
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
