import { z } from 'zod';

export const ContactStatus = z.enum(['lead', 'prospect', 'customer', 'churned']);
export type ContactStatus = z.infer<typeof ContactStatus>;

export const ContactCreateSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
    .optional(),
  company: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  status: ContactStatus.default('lead'),
  tags: z.array(z.string().max(30)).max(10).default([]),
  notes: z.string().max(2000).optional(),
  customFields: z.record(z.string(), z.unknown()).default({}),
});

export const ContactUpdateSchema = ContactCreateSchema.partial();

export const AiScoreSchema = z.object({
  value: z.number().min(0).max(100),
  scoredAt: z.coerce.date(),
  reasoning: z.string(),
  signals: z.object({
    positive: z.array(z.string()),
    negative: z.array(z.string()),
  }),
  recommendedAction: z.string(),
});

export const ContactFiltersSchema = z.object({
  status: ContactStatus.optional(),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  company: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'email', 'company', 'status', 'createdAt', 'updatedAt', 'aiScore.value']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ContactCreate = z.infer<typeof ContactCreateSchema>;
export type ContactUpdate = z.infer<typeof ContactUpdateSchema>;
export type AiScore = z.infer<typeof AiScoreSchema>;
export type ContactFiltersInput = z.infer<typeof ContactFiltersSchema>;
