import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onOpenChange={setOpen} title="Example Modal" description="This is a description.">
          <p className="text-sm text-gray-600">Modal content goes here.</p>
        </Modal>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open With Footer</Button>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Save Changes"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </>
          }
        >
          <p className="text-sm text-gray-600">Are you sure you want to save?</p>
        </Modal>
      </>
    );
  },
};

export const Large: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Large</Button>
        <Modal open={open} onOpenChange={setOpen} title="Large Modal" size="lg">
          <p className="text-sm text-gray-600">This is a large modal with more space.</p>
        </Modal>
      </>
    );
  },
};
