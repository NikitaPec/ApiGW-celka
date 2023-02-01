import { NextFunction, Request, Response } from "express";
import ApiError from "../ApiError.js";

export default function (err: { status: number; response: object }, req: Request, res: Response, next: NextFunction) {
  try {
    if (err instanceof ApiError) {
      console.log(JSON.stringify(err));
      return res.status(err.status).json(err.response);
    }
    console.log(JSON.stringify(err));
    return res.status(500).json({ success: false, data: {}, error: { server: [`${err}`] } });
  } catch (error) {
    next(error);
  }
}
