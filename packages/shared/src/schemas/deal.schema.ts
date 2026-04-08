import { z } from 'zod';

export const DealStage = z.enum([
  'discovery',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);
export type DealStage = z.infer<typeof DealStage>;

export const DealPriority = z.enum(['low', 'medium', 'high']);
export type DealPriority = z.infer<typeof DealPriority>;

export const DealCreateSchema = z.object({
  title: z.string().min(2).max(200),
  value: z.number().min(0).max(100_000_000),
  currency: z.string().length(3).default('USD'),
  stage: DealStage.default('discovery'),
  priority: DealPriority.default('medium'),
  contactId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId'),
  expectedCloseDate: z.coerce.date().optional(),
  description: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
});

export const DealUpdateSchema = DealCreateSchema.partial();

export const DealStageUpdateSchema = z.object({
  stage: DealStage,
});

export const DealFiltersSchema = z.object({
  stage: DealStage.optional(),
  contactId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId').optional(),
  priority: DealPriority.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['value', 'createdAt', 'expectedCloseDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type DealCreate = z.infer<typeof DealCreateSchema>;
export type DealUpdate = z.infer<typeof DealUpdateSchema>;
export type DealStageUpdate = z.infer<typeof DealStageUpdateSchema>;
export type DealFiltersInput = z.infer<typeof DealFiltersSchema>;
