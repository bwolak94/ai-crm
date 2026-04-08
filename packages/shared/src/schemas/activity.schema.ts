import { z } from 'zod';

export const ActivityType = z.enum(['call', 'email', 'note', 'meeting', 'task']);
export type ActivityType = z.infer<typeof ActivityType>;

const objectIdRegex = /^[a-f\d]{24}$/i;

export const ActivityCreateSchema = z.object({
  contactId: z.string().regex(objectIdRegex, 'Invalid ObjectId'),
  dealId: z.string().regex(objectIdRegex, 'Invalid ObjectId').optional(),
  type: ActivityType,
  title: z.string().min(1).max(200),
  body: z.string().max(5000).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ActivityUpdateSchema = z.object({
  type: ActivityType.optional(),
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(5000).optional(),
  scheduledAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ActivityFiltersSchema = z.object({
  type: ActivityType.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ActivityCreate = z.infer<typeof ActivityCreateSchema>;
export type ActivityUpdate = z.infer<typeof ActivityUpdateSchema>;
export type ActivityFiltersInput = z.infer<typeof ActivityFiltersSchema>;
