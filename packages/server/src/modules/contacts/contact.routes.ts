import { Router } from 'express';
import { z } from 'zod';
import { ContactCreateSchema, ContactUpdateSchema, ContactFiltersSchema, ContactStatus } from '@ai-crm/shared';
import { ContactController } from './contact.controller';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { authenticate } from '../../shared/middleware/authenticate';
import { scoringLimiter, followUpLimiter } from '../../shared/middleware/rateLimiter';

const BulkStatusSchema = z.object({
  ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId')).min(1).max(100),
  status: ContactStatus,
});

const FollowUpBodySchema = z.object({
  dealId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId').optional(),
  tone: z.enum(['professional', 'friendly', 'urgent']),
});

export function createContactRoutes(controller: ContactController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', validateRequest(ContactFiltersSchema, 'query'), controller.index);
  router.post('/', validateRequest(ContactCreateSchema), controller.store);
  router.patch('/bulk-status', validateRequest(BulkStatusSchema), controller.bulkStatus);
  router.get('/:id', controller.show);
  router.put('/:id', validateRequest(ContactUpdateSchema), controller.update);
  router.delete('/:id', controller.destroy);

  // AI endpoints
  router.post('/:id/score', scoringLimiter, controller.score);
  router.get('/:id/score-history', controller.scoreHistory);
  router.post('/:id/follow-up', followUpLimiter, validateRequest(FollowUpBodySchema), controller.followUp);
  router.post('/:id/analyze-sentiment', scoringLimiter, controller.analyzeSentiment);
  router.get('/:id/sentiment-history', controller.sentimentHistory);

  return router;
}
