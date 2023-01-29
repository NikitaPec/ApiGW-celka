import fs from "fs";
import { resolve } from "path";
import httpProxy from "express-http-proxy";
import { app } from "../index.js";

export default function creatingRoutesService() {
  const pathServiceList = resolve(process.cwd(), "ServiceList.json");
  const SList = JSON.parse(fs.readFileSync(pathServiceList, { encoding: "utf-8" }));
  SList.forEach((service) => {
    const router = service.rout;
    const url = httpProxy(service.url);
    if (service.status) {
      app.use(router, url);
    } else {
      app.use(
        router,
        (req, res) => {
          return res
            .status(503)
            .json({ success: false, data: {}, errors: { service: [`Сервис ${service.name} временно не доступен.`] } });
        },
        url
      );
    }
  });
}
