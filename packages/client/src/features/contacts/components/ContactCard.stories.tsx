import type { Meta, StoryObj } from '@storybook/react';
import { ContactCard } from './ContactCard';

const meta: Meta<typeof ContactCard> = {
  title: 'Features/Contacts/ContactCard',
  component: ContactCard,
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContactCard>;

export const Lead: Story = {
  args: {
    contact: {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 890',
      company: 'Acme Inc',
      status: 'lead',
    },
  },
};

export const Customer: Story = {
  args: {
    contact: {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Tech Corp',
      status: 'customer',
    },
  },
};
