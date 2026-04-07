import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { authenticate } from '../../shared/middleware/authenticate';
import { LoginSchema, RegisterSchema } from '@ai-crm/shared';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/register', validateRequest(RegisterSchema), controller.register);
  router.post('/login', validateRequest(LoginSchema), controller.login);
  router.post('/refresh', controller.refresh);
  router.post('/logout', authenticate, controller.logout);
  router.get('/profile', authenticate, controller.getProfile);

  return router;
}
