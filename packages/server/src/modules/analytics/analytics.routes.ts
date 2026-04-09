import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../shared/middleware/authenticate';

export function createAnalyticsRoutes(controller: AnalyticsController): Router {
  const router = Router();

  router.use(authenticate);
  router.get('/', controller.index);

  return router;
}
