import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Search, Mail } from 'lucide-react';

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

export const WithLeftIcon: Story = {
  args: { placeholder: 'Search...', leftAddon: <Search size={16} /> },
};

export const WithRightAddon: Story = {
  args: { label: 'Email', placeholder: 'you@example.com', rightAddon: <Mail size={16} /> },
};

export const Disabled: Story = {
  args: { label: 'Disabled', value: 'Cannot edit', disabled: true },
};

export const Required: Story = {
  args: { label: 'Full Name', placeholder: 'Enter your name', required: true },
};
