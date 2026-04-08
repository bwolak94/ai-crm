import { z } from 'zod';
import pino from 'pino';
import { IContactRepository } from '../../modules/contacts/contact.repository';
import { IActivityRepository } from '../../modules/activities/activity.repository';
import { SentimentAnalysisModel, ISentimentAnalysis } from '../../modules/contacts/sentiment-analysis.model';
import { ContactModel } from '../../modules/contacts/contact.model';
import { AiClient } from '../AiClient';
import { buildSentimentPrompt } from '../prompts/sentiment.prompt';
import { AiError } from '../errors/AiError';
import { NotFoundError } from '../../shared/errors/NotFoundError';

const logger = pino({ name: 'sentiment-service' });

const SentimentResponseSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'at-risk']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  flags: z.array(z.string()),
});

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'at-risk';
  confidence: number;
  reasoning: string;
  flags: string[];
}

export class SentimentService {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly activityRepository: IActivityRepository,
    private readonly aiClient: AiClient,
  ) {}

  async analyzeActivity(
    activityId: string,
    activityBody: string,
    activityType: string,
    contactId: string,
    ownerId: string,
  ): Promise<SentimentResult> {
    const contact = await this.contactRepository.findById(contactId, ownerId);
    if (!contact) {
      throw new NotFoundError('Contact');
    }

    const response = await this.aiClient.complete(
      {
        messages: [{
          role: 'user',
          content: buildSentimentPrompt({
            contactName: contact.name,
            text: activityBody,
            activityType,
          }),
        }],
        temperature: 0.2,
      },
      { feature: 'sentiment', ownerId, entityId: contactId },
    );

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(response.content) as Record<string, unknown>;
    } catch {
      throw new AiError('Invalid sentiment response format', response.model);
    }

    const validation = SentimentResponseSchema.safeParse(parsed);
    if (!validation.success) {
      throw new AiError('Sentiment response failed validation', response.model);
    }

    const result = validation.data;

    await SentimentAnalysisModel.create({
      contactId,
      ownerId,
      activityId,
      sentiment: result.sentiment,
      confidence: result.confidence,
      reasoning: result.reasoning,
      flags: result.flags,
    });

    if (result.confidence > 0.7) {
      await ContactModel.findOneAndUpdate(
        { _id: contactId, ownerId },
        { sentiment: result.sentiment },
      );
    }

    return result;
  }

  async analyzeRecentActivities(contactId: string, ownerId: string): Promise<SentimentResult[]> {
    const contact = await this.contactRepository.findById(contactId, ownerId);
    if (!contact) {
      throw new NotFoundError('Contact');
    }

    const activities = await this.activityRepository.findRecentByContact(contactId, ownerId, 10);
    const analyzable = activities.filter(
      (a) => (a.type === 'email' || a.type === 'note') && a.body && a.body.length > 50,
    );

    const results: SentimentResult[] = [];
    for (const activity of analyzable) {
      try {
        const result = await this.analyzeActivity(
          String(activity._id),
          activity.body!,
          activity.type,
          contactId,
          ownerId,
        );
        results.push(result);
      } catch (err) {
        logger.error({ err, activityId: activity._id }, 'Sentiment analysis failed for activity');
      }
    }

    return results;
  }

  async getSentimentHistory(contactId: string, ownerId: string): Promise<ISentimentAnalysis[]> {
    const contact = await this.contactRepository.findById(contactId, ownerId);
    if (!contact) {
      throw new NotFoundError('Contact');
    }

    return SentimentAnalysisModel.find({ contactId, ownerId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean<ISentimentAnalysis[]>();
  }
}
