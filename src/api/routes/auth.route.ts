import { Router } from 'express';
import authController from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/register', authController.registerController);
authRouter.post('/signin', authController.signinController);

export default authRouter;