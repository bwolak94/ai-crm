import { z } from 'zod';

export const ContactStatus = z.enum(['lead', 'prospect', 'customer', 'churned']);
export type ContactStatus = z.infer<typeof ContactStatus>;

export const ContactCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{7,15}$/, 'Invalid phone number format')
    .optional(),
  company: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  status: ContactStatus.default('lead'),
  tags: z.array(z.string()).default([]),
});

export const ContactUpdateSchema = ContactCreateSchema.partial();

export type ContactCreate = z.infer<typeof ContactCreateSchema>;
export type ContactUpdate = z.infer<typeof ContactUpdateSchema>;
