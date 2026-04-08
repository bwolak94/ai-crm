export interface ScoringContext {
  contact: {
    name: string;
    company?: string;
    title?: string;
    status: string;
  };
  stats: {
    activityCount: number;
    lastActivityDaysAgo: number;
    dealCount: number;
    totalDealValue: number;
    emailsOpened: number;
  };
  recentNotes: string[];
  currentStage?: string;
}

export function buildScoringPrompt(context: ScoringContext): string {
  const notes = context.recentNotes.length > 0
    ? context.recentNotes.map((n, i) => `  ${i + 1}. ${n}`).join('\n')
    : '  (none)';

  return `You are a B2B sales lead scoring expert. Analyze the contact below and assign a score from 0 to 100.

## Contact Profile
- Name: ${context.contact.name}
- Company: ${context.contact.company ?? 'Unknown'}
- Title: ${context.contact.title ?? 'Unknown'}
- Current Status: ${context.contact.status}
${context.currentStage ? `- Current Deal Stage: ${context.currentStage}` : ''}

## Engagement Metrics
- Total Activities: ${context.stats.activityCount}
- Days Since Last Activity: ${context.stats.lastActivityDaysAgo}
- Open Deals: ${context.stats.dealCount}
- Total Deal Value: $${context.stats.totalDealValue.toLocaleString()}
- Emails Opened: ${context.stats.emailsOpened}

## Recent Notes
${notes}

## Scoring Criteria
- Activity Recency & Frequency: 30 points max (daily contact = 30, >30 days = 0)
- Company Fit & Title: 20 points max (C-level/VP at known company = 20)
- Deal Pipeline: 25 points max (active deals with high value = 25)
- Engagement Signals: 15 points max (email opens, meeting attendance)
- Momentum: 10 points max (improving trend in activity = 10)

## Required Output Format
// TypeScript type: { score: number; reasoning: string; signals: { positive: string[]; negative: string[] }; recommendedAction: string }
{
  "score": <number 0-100>,
  "reasoning": "<max 2 sentences explaining the score>",
  "signals": {
    "positive": ["<signal1>", "<signal2>"],
    "negative": ["<signal1>", "<signal2>"]
  },
  "recommendedAction": "<one concrete next step>"
}

Return ONLY valid JSON. No explanation, no markdown.`;
}
