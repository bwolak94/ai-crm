import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Customer' },
  { value: 'churned', label: 'Churned' },
];

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: { options: statusOptions, label: 'Status' },
};

export const WithPlaceholder: Story = {
  args: { options: statusOptions, label: 'Status', placeholder: 'Select a status...' },
};

export const WithError: Story = {
  args: { options: statusOptions, label: 'Status', error: 'Status is required' },
};

export const WithHint: Story = {
  args: { options: statusOptions, label: 'Status', hint: 'Select the contact status' },
};

export const Disabled: Story = {
  args: { options: statusOptions, label: 'Status', disabled: true, value: 'lead' },
};
