import { join, dirname } from "path";
import { fileURLToPath } from "url";
import swaggerAutogen from "swagger-autogen";
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Sequelize from "./db.js";
import router from "./router/index.js";
import errorMiddleWare from "./middleWare/errorMiddleWare.js";

const PORT = process.env.PORT;
const _dirname = dirname(fileURLToPath(import.meta.url));
const outputFile = join(_dirname, "output.json");
const endpointsFiles = [join(_dirname, "./router/index.js")];
//swaggerAutogen(/*options*/)(outputFile, endpointsFiles, doc).then(
// ({ success }) => {
//   console.log(`Generated: ${success}`);
// }
//);

const app = express();
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
