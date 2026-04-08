import { AiChatRequest } from '@ai-crm/shared';
import { IContactRepository, ChatContactQuery } from '../../modules/contacts/contact.repository';
import { IDealRepository } from '../../modules/deals/deal.repository';
import { AiClient } from '../AiClient';
import { AiTool, AiToolCall } from '../providers/IAiProvider';
import { buildChatSystemPrompt } from '../prompts/chat.prompt';

export interface AiChatResponse {
  message: string;
  data?: {
    type: 'contacts' | 'pipeline' | 'contact_detail';
    payload: unknown;
  };
  toolsUsed: string[];
}

const CHAT_TOOLS: AiTool[] = [
  {
    name: 'filter_contacts',
    description:
      'Search and filter CRM contacts. Use when user asks about contacts, leads, customers, or people. Returns a list of matching contacts.',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['lead', 'prospect', 'customer', 'churned'],
          description: 'Filter by contact status',
        },
        search: {
          type: 'string',
          description: 'Full-text search on name, email, or company',
        },
        aiScoreMin: {
          type: 'number',
          description: 'Minimum AI score. Use 70 for hot leads.',
        },
        aiScoreMax: {
          type: 'number',
          description: 'Maximum AI score. Use 30 for at-risk contacts.',
        },
        sentiment: {
          type: 'string',
          enum: ['positive', 'neutral', 'at-risk'],
          description: 'Filter by sentiment classification',
        },
        company: {
          type: 'string',
          description: 'Filter by company name',
        },
        createdAfter: {
          type: 'string',
          description: 'ISO 8601 date string. Filter contacts created after this date.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default 10, max 50)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_pipeline_summary',
    description:
      'Get deal pipeline overview grouped by stage with totals. Use when user asks about pipeline, deals, revenue, or forecast.',
    inputSchema: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          enum: ['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
          description: 'Filter by specific deal stage',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_contact_details',
    description:
      'Get full details for a specific contact by name or email. Use when user asks about a specific person.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Name or email to search for',
        },
      },
      required: ['query'],
    },
  },
];

export class AiChatService {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly dealRepository: IDealRepository,
    private readonly aiClient: AiClient,
  ) {}

  async chat(request: AiChatRequest, ownerId: string): Promise<AiChatResponse> {
    const systemPrompt = buildChatSystemPrompt();
    const context = { feature: 'chat', ownerId };

    const firstResponse = await this.aiClient.complete(
      {
        system: systemPrompt,
        messages: request.messages,
        tools: CHAT_TOOLS,
      },
      context,
    );

    if (firstResponse.stopReason !== 'tool_use' || !firstResponse.toolCalls?.length) {
      return {
        message: firstResponse.content,
        toolsUsed: [],
      };
    }

    const toolResults = await this.executeToolCalls(firstResponse.toolCalls, ownerId);
    const toolsUsed = firstResponse.toolCalls.map((tc) => tc.name);

    const toolResultMessages = firstResponse.toolCalls.map((tc, i) => ({
      role: 'user' as const,
      content: `[Tool result for ${tc.name}]: ${JSON.stringify(toolResults[i]!.result)}`,
    }));

    const followUpMessages = [
      ...request.messages,
      { role: 'assistant' as const, content: firstResponse.content || `Using tools: ${toolsUsed.join(', ')}` },
      ...toolResultMessages,
    ];

    const secondResponse = await this.aiClient.complete(
      {
        system: systemPrompt,
        messages: followUpMessages,
      },
      context,
    );

    const primaryResult = toolResults[0];
    const data = primaryResult
      ? { type: primaryResult.type, payload: primaryResult.result }
      : undefined;

    return {
      message: secondResponse.content,
      data,
      toolsUsed,
    };
  }

  private async executeToolCalls(
    toolCalls: AiToolCall[],
    ownerId: string,
  ): Promise<Array<{ type: AiChatResponse['data'] extends undefined ? never : NonNullable<AiChatResponse['data']>['type']; result: unknown }>> {
    const results: Array<{ type: 'contacts' | 'pipeline' | 'contact_detail'; result: unknown }> = [];

    for (const call of toolCalls) {
      const result = await this.executeTool(call, ownerId);
      results.push(result);
    }

    return results;
  }

  private async executeTool(
    call: AiToolCall,
    ownerId: string,
  ): Promise<{ type: 'contacts' | 'pipeline' | 'contact_detail'; result: unknown }> {
    switch (call.name) {
      case 'filter_contacts': {
        const filters = call.input as ChatContactQuery;
        const contacts = await this.contactRepository.chatQuery(ownerId, filters);
        return {
          type: 'contacts',
          result: contacts.map((c) => ({
            id: String(c._id),
            name: c.name,
            email: c.email,
            company: c.company,
            status: c.status,
            sentiment: c.sentiment,
            aiScore: c.aiScore?.value ?? null,
            createdAt: c.createdAt,
          })),
        };
      }

      case 'get_pipeline_summary': {
        const stageFilter = call.input.stage as string | undefined;
        const summary = await this.dealRepository.getPipelineSummary(ownerId);
        const filtered = stageFilter
          ? summary.filter((s) => s.stage === stageFilter)
          : summary;
        return { type: 'pipeline', result: filtered };
      }

      case 'get_contact_details': {
        const query = call.input.query as string;
        const contact = await this.contactRepository.searchByNameOrEmail(ownerId, query);
        return {
          type: 'contact_detail',
          result: contact
            ? {
                id: String(contact._id),
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                company: contact.company,
                title: contact.title,
                status: contact.status,
                sentiment: contact.sentiment,
                aiScore: contact.aiScore,
                tags: contact.tags,
                createdAt: contact.createdAt,
              }
            : null,
        };
      }

      default:
        return { type: 'contacts', result: [] };
    }
  }
}
