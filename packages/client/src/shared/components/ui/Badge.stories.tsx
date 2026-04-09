import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { variant: 'default', children: 'Default' },
};

export const Success: Story = {
  args: { variant: 'success', children: 'Success' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Warning' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Danger' },
};

export const Info: Story = {
  args: { variant: 'info', children: 'Info' },
};

export const AllContactStatuses: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge status="lead" />
      <Badge status="prospect" />
      <Badge status="customer" />
      <Badge status="churned" />
      <Badge status="at-risk" />
      <Badge status="positive" />
    </div>
  ),
};

export const WithDot: Story = {
  args: { status: 'customer', dot: true },
};

export const Small: Story = {
  args: { status: 'lead', size: 'sm' },
};
