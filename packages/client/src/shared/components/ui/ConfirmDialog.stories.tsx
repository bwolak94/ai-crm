import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from './Button';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const DangerDelete: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Delete Contact</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete Contact"
          message="This action cannot be undone. Are you sure you want to delete this contact?"
          variant="danger"
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
};

export const DefaultConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Confirm Action</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Confirm"
          message="Are you sure you want to proceed?"
          confirmLabel="Yes, proceed"
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
};
