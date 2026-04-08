import { AiScoreSchema } from '@ai-crm/shared';
import { IContactRepository } from './contact.repository';
import { IActivityRepository } from '../activities/activity.repository';
import { IContact } from './contact.model';
import { IActivity } from '../activities/activity.model';
import { ScoringHistoryModel, IScoringHistory } from './scoring-history.model';
import { AiClient } from '../../ai/AiClient';
import { buildScoringPrompt, ScoringContext } from '../../ai/prompts/scoring.prompt';
import { AiError } from '../../ai/errors/AiError';
import { NotFoundError } from '../../shared/errors/NotFoundError';

export interface ScoringResult {
  score: number;
  reasoning: string;
  signals: { positive: string[]; negative: string[] };
  recommendedAction: string;
  previousScore: number | null;
  model: string;
}

export interface BatchScoringResult {
  succeeded: number;
  failed: number;
  errors: Array<{ contactId: string; message: string }>;
}

export class ContactScoringService {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly activityRepository: IActivityRepository,
    private readonly aiClient: AiClient,
  ) {}

  async scoreContact(contactId: string, ownerId: string): Promise<ScoringResult> {
    const contact = await this.contactRepository.findById(contactId, ownerId);
    if (!contact) {
      throw new NotFoundError('Contact');
    }

    const activities = await this.activityRepository.findRecentByContact(contactId, ownerId, 30);
    const scoringContext = this.buildScoringContext(contact, activities);

    const response = await this.aiClient.complete(
      {
        messages: [{ role: 'user', content: buildScoringPrompt(scoringContext) }],
        temperature: 0.3,
      },
      { feature: 'lead_scoring', ownerId, entityId: contactId },
    );

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(response.content) as Record<string, unknown>;
    } catch {
      throw new AiError('Invalid scoring response format', response.model);
    }

    const validation = AiScoreSchema.safeParse({
      ...parsed,
      scoredAt: new Date(),
    });
    if (!validation.success) {
      throw new AiError('Scoring response failed validation', response.model);
    }

    const result = validation.data;
    const previousScore = contact.aiScore?.value ?? null;

    await this.contactRepository.updateAiScore(contactId, ownerId, {
      value: result.value,
      scoredAt: result.scoredAt,
      reasoning: result.reasoning,
      signals: result.signals,
    });

    const tokensUsed = response.usage.inputTokens + response.usage.outputTokens;

    await ScoringHistoryModel.create({
      contactId,
      ownerId,
      score: result.value,
      previousScore,
      reasoning: result.reasoning,
      signals: result.signals,
      recommendedAction: result.recommendedAction,
      aiModel: response.model,
      tokensUsed,
    });

    return {
      score: result.value,
      reasoning: result.reasoning,
      signals: result.signals,
      recommendedAction: result.recommendedAction,
      previousScore,
      model: response.model,
    };
  }

  async scoreBatch(contactIds: string[], ownerId: string): Promise<BatchScoringResult> {
    const results = await Promise.allSettled(
      contactIds.map((id) => this.scoreContact(id, ownerId)),
    );

    const errors: Array<{ contactId: string; message: string }> = [];
    let succeeded = 0;
    let failed = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        succeeded++;
      } else {
        failed++;
        errors.push({
          contactId: contactIds[index]!,
          message: result.reason?.message ?? 'Unknown error',
        });
      }
    });

    return { succeeded, failed, errors };
  }

  async getScoreHistory(
    contactId: string,
    ownerId: string,
    limit = 30,
  ): Promise<IScoringHistory[]> {
    const contact = await this.contactRepository.findById(contactId, ownerId);
    if (!contact) {
      throw new NotFoundError('Contact');
    }

    return ScoringHistoryModel.find({ contactId, ownerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<IScoringHistory[]>();
  }

  private buildScoringContext(contact: IContact, activities: IActivity[]): ScoringContext {
    const now = Date.now();

    const lastActivity = activities[0];
    const lastActivityDaysAgo = lastActivity
      ? Math.floor((now - lastActivity.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const emailsOpened = activities.filter((a) => a.type === 'email').length;

    const recentNotes = activities
      .filter((a) => a.type === 'note' && a.body)
      .slice(0, 5)
      .map((a) => a.body!.slice(0, 200));

    return {
      contact: {
        name: contact.name,
        company: contact.company,
        title: contact.title,
        status: contact.status,
      },
      stats: {
        activityCount: activities.length,
        lastActivityDaysAgo,
        dealCount: 0,
        totalDealValue: 0,
        emailsOpened,
      },
      recentNotes,
    };
  }
}
