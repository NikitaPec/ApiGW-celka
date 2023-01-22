import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Sequelize from "./db.js";
import router from "./router/index.js";
import errorMiddleWare from "./middleWare/errorMiddleWare.js";

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({}));
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
