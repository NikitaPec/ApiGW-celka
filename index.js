import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swagger from "swagger-ui-express";
import Sequelize from "./db.js";
import router from "./router/index.js";
import errorMiddleWare from "./middleWare/errorMiddleWare.js";

const { default: swaggerDoc } = await import("./swaggerDoc.json", {
  assert: {
    type: "json",
  },
});
const PORT = process.env.PORT;

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
app.use("/doc", swagger.serve, swagger.setup(swaggerDoc));
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
