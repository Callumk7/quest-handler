import { z } from "zod";
// zod validation, primarily for data returned from IGDB.
const genreType = z.object({
	id: z.number(),
	name: z.string(),
});

const coverType = z.object({
	id: z.number(),
	image_id: z.string(),
});

const screenshotType = z.object({
	id: z.number(),
	image_id: z.string(),
});

const artworkType = z.object({
	id: z.number(),
	image_id: z.string(),
});

const IGDBGameSchema = z.object({
	id: z.number(),
	genres: z.array(genreType).optional(),
	name: z.string(),
	cover: coverType,
	storyline: z.string().optional(),
	screenshots: z.array(screenshotType).optional(),
	artworks: z.array(artworkType),
	aggregated_rating: z.number().optional(),
	aggregated_rating_count: z.number().optional(),
	involved_companies: z.array(z.number()).optional(),
	first_release_date: z.number().optional(),
});

type IGDBGame = z.infer<typeof IGDBGameSchema>;
// type IGDBGame = {
// 	id: number;
// 	url: string;
// 	genres:
// 		| {
// 				id: number;
// 				name: string;
// 		  }[]
// 		| undefined;
// 	name: string;
// 	cover: {
// 		id: number;
// 		image_id: string;
// 	};
// 	storyline: string | undefined;
// 	screenshots:
// 		| {
// 				id: number;
// 				image_id: string;
// 		  }[]
// 		| undefined;
// 	artworks: {
// 		id: number;
// 		image_id: string;
// 	}[];
// 	aggregated_rating: number | undefined;
// 	aggregated_rating_count: number | undefined;
// 	involved_companies?: number[] | undefined;
// 	first_release_date: number;
// };
//
type IGDBImage =
	| "cover_small"
	| "screenshot_med"
	| "cover_big"
	| "logo_med"
	| "screenshot_big"
	| "screenshot_huge"
	| "thumb"
	| "micro"
	| "720p"
	| "1080p";

export type { IGDBGame, IGDBImage };

/// ERROR class
export class QuestError extends Error {
	public readonly middleware?: string;

	constructor(message?: string, middleware?: string) {
		super(message);

		// proper stack tracing
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, QuestError);
		}

		this.name = "QuestError";
		this.middleware = middleware;
	}
}

export type Artwork = {
	type: "screenshot" | "artwork";
	image_id: string;
};

type Rating = {
	aggregated_rating: number;
	aggregated_rating_count: number;
};

type PayloadBodyProps = {
	genres?: {
		id: number;
		name: string;
	}[];
	artwork?: Artwork[];
	storyline?: string;
	rating?: Rating;
};

type Job = {
	id: number;
	type: "genre" | "artwork" | "storyline" | "rating";
	payload: {
		gameId: number;
	} & PayloadBodyProps;
};

export type { Job };
