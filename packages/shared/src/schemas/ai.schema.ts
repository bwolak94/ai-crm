import { z } from 'zod';

export const AiChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});

export const AiChatRequestSchema = z.object({
  messages: z.array(AiChatMessageSchema).min(1).max(20),
});

export const GenerateFollowUpRequestSchema = z.object({
  contactId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId'),
  dealId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId').optional(),
  tone: z.enum(['professional', 'friendly', 'urgent']),
});

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>;
export type AiChatRequest = z.infer<typeof AiChatRequestSchema>;
export type GenerateFollowUpRequest = z.infer<typeof GenerateFollowUpRequestSchema>;
