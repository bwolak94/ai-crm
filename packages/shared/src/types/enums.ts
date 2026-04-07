export const CONTACT_STATUS = {
  LEAD: 'lead',
  PROSPECT: 'prospect',
  CUSTOMER: 'customer',
  CHURNED: 'churned',
} as const;

export type ContactStatusValue = (typeof CONTACT_STATUS)[keyof typeof CONTACT_STATUS];

export const DEAL_STAGE = {
  DISCOVERY: 'discovery',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost',
} as const;

export type DealStageValue = (typeof DEAL_STAGE)[keyof typeof DEAL_STAGE];

export const DEAL_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type DealPriorityValue = (typeof DEAL_PRIORITY)[keyof typeof DEAL_PRIORITY];

export const ACTIVITY_TYPE = {
  CALL: 'call',
  EMAIL: 'email',
  NOTE: 'note',
  MEETING: 'meeting',
  TASK: 'task',
} as const;

export type ActivityTypeValue = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];
