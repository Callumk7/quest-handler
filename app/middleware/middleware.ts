import { NextFunction, Request, Response } from "express";

export const logTime = (req: Request, res: Response, next: NextFunction) => {
	console.log(new Date().toString());
	next();
};
