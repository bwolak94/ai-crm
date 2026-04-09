import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: 'Enter your message...' },
};

export const WithLabel: Story = {
  args: { label: 'Notes', placeholder: 'Add notes...', required: true },
};

export const WithError: Story = {
  args: { label: 'Description', error: 'Description is required' },
};

export const WithCharCount: Story = {
  args: { label: 'Bio', maxLength: 200, showCount: true, value: 'Hello world' },
};

export const NoResize: Story = {
  args: { label: 'Fixed', resize: 'none', rows: 3 },
};

export const Disabled: Story = {
  args: { label: 'Disabled', value: 'Cannot edit', disabled: true },
};
