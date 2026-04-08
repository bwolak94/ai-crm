import { Router } from 'express';
import {
  DealCreateSchema,
  DealUpdateSchema,
  DealStageUpdateSchema,
  DealFiltersSchema,
} from '@ai-crm/shared';
import { DealController } from './deal.controller';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { authenticate } from '../../shared/middleware/authenticate';

export function createDealRoutes(controller: DealController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', validateRequest(DealFiltersSchema, 'query'), controller.index);
  router.post('/', validateRequest(DealCreateSchema), controller.store);
  router.get('/pipeline', controller.pipeline);
  router.get('/:id', controller.show);
  router.put('/:id', validateRequest(DealUpdateSchema), controller.update);
  router.patch('/:id/stage', validateRequest(DealStageUpdateSchema), controller.updateStage);
  router.delete('/:id', controller.destroy);

  return router;
}
