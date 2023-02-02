import { Router } from "express";
import UserController from "../controller/UserController.js";
import authMiddleWare from "../middleWare/authMiddleWare.js";
const router = Router();

router.post("/registration", UserController.registration);
router.post("/recovery", UserController.recovery);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.get("/get-key-password-recovery", UserController.passwordRecovery);
router.get("/check-auth", authMiddleWare, UserController.checkAuth);
router.get("/activate/:link", UserController.activate);
router.get("/refresh", UserController.refresh);

export default router;
