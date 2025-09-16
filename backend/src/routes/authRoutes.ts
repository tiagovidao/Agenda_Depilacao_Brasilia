import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { loginValidation, registerValidation } from '../middleware/validation';

const router = Router();
const authController = new AuthController();

router.post('/login', loginValidation, authController.login);

router.post('/register', registerValidation, authController.register);

export default router;