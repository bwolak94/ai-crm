export interface SentimentContext {
  contactName: string;
  text: string;
  activityType: string;
}

export function buildSentimentPrompt(context: SentimentContext): string {
  return `You are a sales relationship health analyst. Analyze the following ${context.activityType} content from/about ${context.contactName}.

## Content to Analyze
${context.text.slice(0, 2000)}

## Classification Guide
- "at-risk" signals: frustration, competitor mentions, budget concerns, deadline pressure, cancellation hints, unresponsiveness
- "positive" signals: enthusiasm, urgency to buy, referral mentions, praise, expansion interest, timeline commitment
- "neutral": standard business communication, no strong signals either way

## Required Output Format
{
  "sentiment": "positive" | "neutral" | "at-risk",
  "confidence": <number 0.0-1.0>,
  "reasoning": "<one sentence explanation>",
  "flags": ["<detected signal 1>", "<detected signal 2>"]
}

Return ONLY valid JSON. No explanation, no markdown.`;
}
