import { Router } from "express";
import userRouter from "../User/router/userRouter.js";

const router = Router();
router.use("/", userRouter);

export default router;
