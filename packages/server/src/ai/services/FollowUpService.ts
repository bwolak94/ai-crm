import { z } from 'zod';
import { GenerateFollowUpRequest } from '@ai-crm/shared';
import { IContactRepository } from '../../modules/contacts/contact.repository';
import { IDealRepository } from '../../modules/deals/deal.repository';
import { IActivityRepository } from '../../modules/activities/activity.repository';
import { AiClient } from '../AiClient';
import { FOLLOW_UP_SYSTEM_PROMPT, buildFollowUpPrompt, FollowUpContext } from '../prompts/followup.prompt';
import { AiError } from '../errors/AiError';
import { NotFoundError } from '../../shared/errors/NotFoundError';

const FollowUpResponseSchema = z.object({
  subject: z.string(),
  body: z.string(),
  keyPoints: z.array(z.string()),
  callToAction: z.string(),
});

export interface FollowUpResult {
  subject: string;
  body: string;
  keyPoints: string[];
  callToAction: string;
}

export class FollowUpService {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly dealRepository: IDealRepository,
    private readonly activityRepository: IActivityRepository,
    private readonly aiClient: AiClient,
  ) {}

  async generate(request: GenerateFollowUpRequest, ownerId: string): Promise<FollowUpResult> {
    const contact = await this.contactRepository.findById(request.contactId, ownerId);
    if (!contact) {
      throw new NotFoundError('Contact');
    }

    const deal = request.dealId
      ? await this.dealRepository.findById(request.dealId, ownerId)
      : null;

    if (request.dealId && !deal) {
      throw new NotFoundError('Deal');
    }

    const activities = await this.activityRepository.findRecentByContact(
      request.contactId,
      ownerId,
      10,
    );

    const context: FollowUpContext = {
      contactName: contact.name,
      company: contact.company,
      title: contact.title,
      tone: request.tone,
      recentActivities: activities.map((a) => ({
        type: a.type,
        title: a.title,
        date: a.createdAt.toISOString().split('T')[0]!,
      })),
      ...(deal && {
        dealTitle: deal.title,
        dealStage: deal.stage,
        dealValue: deal.value,
      }),
    };

    const response = await this.aiClient.complete(
      {
        system: FOLLOW_UP_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildFollowUpPrompt(context) }],
        temperature: 0.7,
      },
      { feature: 'follow_up', ownerId, entityId: request.contactId },
    );

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(response.content) as Record<string, unknown>;
    } catch {
      throw new AiError('Invalid follow-up response format', response.model);
    }

    const validation = FollowUpResponseSchema.safeParse(parsed);
    if (!validation.success) {
      throw new AiError('Follow-up response failed validation', response.model);
    }

    const result = validation.data;

    await this.activityRepository.create({
      contactId: request.contactId,
      dealId: request.dealId,
      ownerId,
      type: 'email',
      title: result.subject,
      body: result.body,
      metadata: { aiGenerated: true, tone: request.tone },
    });

    return result;
  }
}
