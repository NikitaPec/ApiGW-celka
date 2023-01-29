import "dotenv/config";
import fs from "fs";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swagger from "swagger-ui-express";
import Sequelize from "./db.js";
import router from "./router/index.js";
import errorMiddleWare from "./middleWare/errorMiddleWare.js";
//import { CronJob } from "cron";
//import clearLogs from "./utils/clearLog.js";
import creatingRoutesService from "./utils/buildingRoutes.js";

const swaggerDoc = JSON.parse(fs.readFileSync("./swaggerDoc.json", "utf-8"));

const PORT = process.env.PORT;

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
    origin: "http://localhost:8080",
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
  } catch (error) {
    console.log(error);
  }
};

start();
