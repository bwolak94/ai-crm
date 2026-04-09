import type { Meta, StoryObj } from '@storybook/react';
import { DealCard } from './DealCard';
import type { Deal } from '../api/pipeline.api';

const baseDeal: Deal = {
  _id: '1',
  title: 'Enterprise SaaS License',
  value: 45000,
  currency: 'USD',
  stage: 'proposal',
  priority: 'high',
  contactId: 'c1',
  contactName: 'Jane Smith',
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const meta: Meta<typeof DealCard> = {
  title: 'Pipeline/DealCard',
  component: DealCard,
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DealCard>;

export const Default: Story = {
  args: { deal: baseDeal },
};

export const LowPriority: Story = {
  args: {
    deal: { ...baseDeal, priority: 'low', value: 5000 },
  },
};

export const AtRisk: Story = {
  args: {
    deal: {
      ...baseDeal,
      expectedCloseDate: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ),
      priority: 'high',
    },
  },
};

export const NoContact: Story = {
  args: {
    deal: { ...baseDeal, contactName: undefined },
  },
};
