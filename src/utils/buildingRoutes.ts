import { NextFunction, Request, Response } from "express";
import httpProxy from "express-http-proxy";
import fs from "fs";
import ApiResponse from "../dto/ApiResponseDto.js";
import { app } from "../main.js";
import authMiddleWare from "../User/middleWare/authMiddleWare.js";

const SList = JSON.parse(fs.readFileSync("./src/files/ServiceList.json", "utf-8"));

export default function creatingRoutesService() {
  SList.forEach((service: { rout: string; url: string; status: boolean; name: string }) => {
    const router = service.rout;
    const url = httpProxy(service.url);
    if (service.status) {
      app.use(router, authMiddleWare, url);
    } else {
      app.use(
        router,
        (req: Request, res: Response, next: NextFunction) => {
          try {
            const apiResponse = new ApiResponse();
            apiResponse.setError("service", `Сервис ${service.name} временно не доступен.`);
            if (!apiResponse.isSuccess) {
              return res.status(503).json();
            }
          } catch (error) {
            next(error);
          }
        },
        url
      );
    }
  });
}
