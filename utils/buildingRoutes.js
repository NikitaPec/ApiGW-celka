import httpProxy from "express-http-proxy";
import { app } from "../index.js";
import authMiddleWare from "../middleWare/authMiddleWare.js";
const { default: SList } = await import("../ServiceList.json", {
  assert: {
    type: "json",
  },
});

export default function creatingRoutesService() {
  SList.forEach((service) => {
    const router = service.rout;
    const url = httpProxy(service.url);
    if (service.status) {
      app.use(router, authMiddleWare, url);
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
