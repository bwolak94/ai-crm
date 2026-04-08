export interface SentimentContext {
  contactName: string;
  recentActivities: Array<{
    type: string;
    title: string;
    body?: string;
    date: string;
  }>;
}

export function buildSentimentPrompt(context: SentimentContext): string {
  const activities = context.recentActivities
    .map((a) => `- [${a.date}] ${a.type}: ${a.title}${a.body ? ` — ${a.body.slice(0, 200)}` : ''}`)
    .join('\n');

  return `You are a customer relationship analyst. Analyze the recent interactions with ${context.contactName} and determine their sentiment.

## Recent Interactions
${activities || '(no recent interactions)'}

## Required Output Format
{
  "sentiment": "positive" | "neutral" | "at-risk",
  "confidence": <number 0.0-1.0>,
  "reasoning": "<one sentence explanation>"
}

Return ONLY valid JSON. No explanation, no markdown.`;
}
