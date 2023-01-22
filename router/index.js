import { Router } from 'express';
import UserController from '../controller/UserController.js';
import validateMiddleWare from '../middleWare/validateMiddleWare.js';
const router = new Router();

router.post('/registration', validateMiddleWare, UserController.registration);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.get('/activate/:link', UserController.activate);
router.get('/refresh', UserController.refresh);

export default router;
