import { Router } from "express";
import UserController from "../controller/UserController.js";
import authMiddleWare from "../middleWare/authMiddleWare.js";
import validateMiddleWare from "../middleWare/validateMiddleWare.js";
const router = Router();

router.post("/registration", validateMiddleWare, UserController.registration);
router.post("/password-recovery", UserController.passwordRecovery);
router.get("/recovery/:link", UserController.recovery);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);
router.get("/check-auth", authMiddleWare, UserController.checkAuth);
router.get("/activate/:link", UserController.activate);
router.get("/refresh", UserController.refresh);

export default router;
