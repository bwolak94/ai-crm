export const FOLLOW_UP_SYSTEM_PROMPT = `You are a professional sales assistant. Generate concise, personalized follow-up messages for B2B sales contacts. Match the requested tone. Keep messages under 200 words. Do not use generic filler — every sentence should be specific to the context provided.`;

export interface FollowUpContext {
  contactName: string;
  company?: string;
  lastInteraction: string;
  dealTitle?: string;
  dealStage?: string;
  tone: 'professional' | 'friendly' | 'urgent';
}

export function buildFollowUpUserPrompt(context: FollowUpContext): string {
  return `Write a follow-up message for:

Contact: ${context.contactName}${context.company ? ` at ${context.company}` : ''}
Last Interaction: ${context.lastInteraction}
${context.dealTitle ? `Deal: ${context.dealTitle} (Stage: ${context.dealStage ?? 'unknown'})` : 'No active deal'}
Tone: ${context.tone}

Return only the message text, no subject line or metadata.`;
}
