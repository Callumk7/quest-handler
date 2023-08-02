import { IGDBGame } from "..";

declare global {
	namespace Express {
		interface Request {
			games?: IGDBGame[];
		}
	}
}
