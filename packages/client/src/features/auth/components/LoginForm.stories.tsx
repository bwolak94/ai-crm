import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from './LoginForm';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof LoginForm> = {
  title: 'Features/Auth/LoginForm',
  component: LoginForm,
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
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  args: { onSubmit: (data) => console.log(data) },
};

export const WithError: Story = {
  args: { onSubmit: (data) => console.log(data), error: 'Invalid credentials' },
};

export const Loading: Story = {
  args: { onSubmit: (data) => console.log(data), loading: true },
};
