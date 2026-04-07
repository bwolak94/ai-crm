export {
  ContactCreateSchema,
  ContactUpdateSchema,
  ContactStatus,
  AiScoreSchema,
  ContactFiltersSchema,
  type ContactCreate,
  type ContactUpdate,
  type AiScore,
  type ContactFiltersInput,
} from './contact.schema';

export {
  DealCreateSchema,
  DealUpdateSchema,
  DealStageUpdateSchema,
  DealStage,
  DealPriority,
  type DealCreate,
  type DealUpdate,
  type DealStageUpdate,
} from './deal.schema';

export {
  LoginSchema,
  RegisterSchema,
  type Login,
  type Register,
} from './auth.schema';

export {
  ActivityCreateSchema,
  ActivityType,
  type ActivityCreate,
} from './activity.schema';

export {
  AiChatMessageSchema,
  AiChatRequestSchema,
  GenerateFollowUpRequestSchema,
  type AiChatMessage,
  type AiChatRequest,
  type GenerateFollowUpRequest,
} from './ai.schema';
