import { z } from 'zod';

export const DealStage = z.enum([
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
]);
export type DealStage = z.infer<typeof DealStage>;

export const DealCreateSchema = z.object({
  title: z.string().min(2).max(200),
  value: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  stage: DealStage.default('qualification'),
  contactId: z.string().min(1),
  expectedCloseDate: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
});

export const DealUpdateSchema = DealCreateSchema.partial();

export type DealCreate = z.infer<typeof DealCreateSchema>;
export type DealUpdate = z.infer<typeof DealUpdateSchema>;
