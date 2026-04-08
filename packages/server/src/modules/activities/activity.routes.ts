import { Router } from 'express';
import { z } from 'zod';
import {
  ActivityType,
  ActivityUpdateSchema,
  ActivityFiltersSchema,
} from '@ai-crm/shared';
import { ActivityController } from './activity.controller';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { authenticate } from '../../shared/middleware/authenticate';

const ActivityBodySchema = z.object({
  dealId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId').optional(),
  type: ActivityType,
  title: z.string().min(1).max(200),
  body: z.string().max(5000).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export function createActivityRoutes(controller: ActivityController): {
  contactActivities: Router;
  dealActivities: Router;
  activities: Router;
} {
  const contactActivities = Router({ mergeParams: true });
  const dealActivities = Router({ mergeParams: true });
  const activities = Router();

  contactActivities.use(authenticate);
  dealActivities.use(authenticate);
  activities.use(authenticate);

  // GET /api/contacts/:contactId/activities
  contactActivities.get('/', validateRequest(ActivityFiltersSchema, 'query'), controller.timeline);
  // POST /api/contacts/:contactId/activities
  contactActivities.post('/', validateRequest(ActivityBodySchema), controller.store);

  // GET /api/deals/:dealId/activities
  dealActivities.get('/', controller.byDeal);

  // PUT /api/activities/:id
  activities.put('/:id', validateRequest(ActivityUpdateSchema), controller.update);
  // DELETE /api/activities/:id
  activities.delete('/:id', controller.destroy);

  return { contactActivities, dealActivities, activities };
}
