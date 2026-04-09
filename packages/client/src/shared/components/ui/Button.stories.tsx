import type { Meta, StoryObj } from '@storybook/react';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary Button' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Danger Button' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost Button' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Link Button' },
};

export const Loading: Story = {
  args: { variant: 'primary', loading: true, children: 'Loading...' },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true, children: 'Disabled' },
};

export const WithLeftIcon: Story = {
  args: { variant: 'primary', leftIcon: <Plus size={16} />, children: 'Add Contact' },
};

export const WithRightIcon: Story = {
  args: { variant: 'primary', rightIcon: <ArrowRight size={16} />, children: 'Continue' },
};

export const FullWidth: Story = {
  args: { variant: 'primary', fullWidth: true, children: 'Full Width' },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="md">MD</Button>
      <Button size="lg">LG</Button>
    </div>
  ),
};
