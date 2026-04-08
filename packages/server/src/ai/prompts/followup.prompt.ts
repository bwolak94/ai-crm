export const FOLLOW_UP_SYSTEM_PROMPT = `You are an expert B2B sales copywriter. Generate concise, personalized follow-up emails.

Rules:
- Body must be under 150 words
- Every sentence must be specific to the context — never generic filler
- Match the requested tone exactly
- End with a single clear call-to-action
- Be natural and human — avoid corporate jargon

Return ONLY valid JSON. No explanation, no markdown.`;

export interface FollowUpContext {
  contactName: string;
  company?: string;
  title?: string;
  tone: 'professional' | 'friendly' | 'urgent';
  recentActivities: Array<{
    type: string;
    title: string;
    date: string;
  }>;
  dealTitle?: string;
  dealStage?: string;
  dealValue?: number;
}

export function buildFollowUpPrompt(context: FollowUpContext): string {
  const activities = context.recentActivities
    .map((a) => `- [${a.date}] ${a.type}: ${a.title}`)
    .join('\n');

  return `Generate a follow-up email for:

## Contact
- Name: ${context.contactName}
- Company: ${context.company ?? 'Unknown'}
- Title: ${context.title ?? 'Unknown'}

## Recent Activity
${activities || '(no recent activity)'}

${context.dealTitle ? `## Active Deal\n- Title: ${context.dealTitle}\n- Stage: ${context.dealStage ?? 'unknown'}\n- Value: $${context.dealValue?.toLocaleString() ?? 'N/A'}` : '## No active deal'}

## Tone: ${context.tone}

## Required Output Format
{
  "subject": "<email subject line>",
  "body": "<email body, max 150 words>",
  "keyPoints": ["<point1>", "<point2>"],
  "callToAction": "<single clear CTA>"
}`;
}
