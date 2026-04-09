import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithInitials: Story = {
  args: { name: 'John Doe', size: 'md' },
};

export const SingleName: Story = {
  args: { name: 'Alice', size: 'md' },
};

export const Small: Story = {
  args: { name: 'Jane Smith', size: 'sm' },
};

export const Large: Story = {
  args: { name: 'Bob Wilson', size: 'lg' },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="John Doe" size="sm" />
      <Avatar name="John Doe" size="md" />
      <Avatar name="John Doe" size="lg" />
    </div>
  ),
};

export const DeterministicColors: Story = {
  render: () => (
    <div className="flex gap-2">
      {['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'].map((name) => (
        <Avatar key={name} name={name} size="md" />
      ))}
    </div>
  ),
};
