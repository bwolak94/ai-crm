import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { AuthLoginSchema, AuthRegisterSchema } from '@ai-crm/shared';

const router = Router();
const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/register', validateRequest(AuthRegisterSchema), authController.register);
router.post('/login', validateRequest(AuthLoginSchema), authController.login);

export { router as authRoutes };
