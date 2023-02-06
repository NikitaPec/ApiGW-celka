import "dotenv/config";
import fs from "fs";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swagger from "swagger-ui-express";
import Sequelize from "./dataBase/db.js";
import router from "./mainRouter/router.js";
import errorMiddleWare from "./exception/middleWare/errorMiddleWare.js";
//import { CronJob } from "cron";
//import clearLogs from "./utils/clearLog.js";
import creatingRoutesService from "./utils/buildingRoutes.js";

const swaggerDoc = JSON.parse(fs.readFileSync("./src/files/swaggerDoc.json", "utf-8"));

const PORT = process.env.PORT;
("./logger/error.log");
/*const startClearLog = new CronJob(
  "15 3 * * 1",
  function () {
    clearLogs();
  },
  null,
  true,
  "Europe/Moscow"
);
*/
export const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.set("trust proxy", true);
app.use("/api", router);
app.use("/doc", swagger.serve, swagger.setup(swaggerDoc));
creatingRoutesService();
app.use(errorMiddleWare);
const start = async () => {
  try {
    await Sequelize.authenticate();
    await Sequelize.sync();
    app.listen(PORT);
  } catch (error) {}
};

start();
