import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Search } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Enter text...' },
};

export const WithLabel: Story = {
  args: { label: 'Email', placeholder: 'you@example.com', required: true },
};

export const WithError: Story = {
  args: { label: 'Email', value: 'invalid', error: 'Please enter a valid email address' },
};

export const WithHint: Story = {
  args: { label: 'Password', type: 'password', hint: 'Must be at least 8 characters' },
};

export const WithPrefix: Story = {
  args: { placeholder: 'Search...', prefix: <Search size={16} /> },
};
