import { Job } from "../types";
import redis from "./client";

const jobQueue = "jobs";
export async function listenForJobs() {
	const loop = true;
	while (loop) {
		const result = await redis.brpop(jobQueue, 5);

		if (result) {
			console.log("printing listen for jobs result:", result[1]);
			const job = JSON.parse(result[1]);
			await processJob(job);
		}
	}
}

async function processJob(job: Job) {
	let url: string = "";
	switch (job.type) {
		case "artwork":
			url = "/artwork";
			break;
		case "genre":
			url = "/genres";
			break;
		case "storyline":
			url = "/games";
			break;
		case "rating":
			url = "/games";
			break;

		default:
			break;
	}

	const res = await fetch(`http://localhost:3000/api/${url}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(job),
	});

	if (res.ok) {
		const resBody = await res.text();
		console.log(`Job processed: ${job.id}, response: ${JSON.stringify(resBody)}`);
	} else {
		console.log(`Unable to process job ${job.id}, Status: ${res.status}`);
	}
}

export async function processInitialJobs() {
	let loop = true;
	while (loop) {
		const jobData = await redis.rpop(jobQueue);

		if (jobData) {
			console.log("jobdata from processInitialJobs:", jobData);
			console.log(jobData.charCodeAt(0));
			const job = JSON.parse(jobData);
			await processJob(job);
		} else {
			loop = false;
		}
	}

	listenForJobs();
}
