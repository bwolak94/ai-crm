import type { Meta, StoryObj } from '@storybook/react';
import { ContactForm } from './ContactForm';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof ContactForm> = {
  title: 'Features/Contacts/ContactForm',
  component: ContactForm,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="mx-auto max-w-md p-8">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContactForm>;

export const Empty: Story = {
  args: { onSubmit: (data) => console.log(data) },
};

export const Prefilled: Story = {
  args: {
    onSubmit: (data) => console.log(data),
    defaultValues: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 890',
      company: 'Acme Inc',
      status: 'customer',
    },
  },
};
