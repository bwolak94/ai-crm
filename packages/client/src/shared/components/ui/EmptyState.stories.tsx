import type { Meta, StoryObj } from '@storybook/react';
import { Users, Search } from 'lucide-react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'No contacts found',
    description: 'Get started by creating your first contact.',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <Users size={48} />,
    title: 'No contacts yet',
    description: 'Add your first contact to get started.',
    action: { label: 'Add Contact', onClick: () => alert('clicked') },
  },
};

export const SearchEmpty: Story = {
  args: {
    icon: <Search size={48} />,
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
  },
};
