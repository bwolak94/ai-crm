import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Lead: Story = {
  args: { status: 'lead' },
};

export const Prospect: Story = {
  args: { status: 'prospect' },
};

export const Customer: Story = {
  args: { status: 'customer' },
};

export const Churned: Story = {
  args: { status: 'churned' },
};
