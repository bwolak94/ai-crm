import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../../src/shared/components/ui/Modal';

describe('Modal', () => {
  it('renders title and children when open', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} title="Test" description="A description">
        <span />
      </Modal>,
    );
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('renders footer content', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} title="Test" footer={<button>Save</button>}>
        <span />
      </Modal>,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('has a close button', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} title="Test">
        <span />
      </Modal>,
    );
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('calls onOpenChange when close button clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Modal open={true} onOpenChange={onOpenChange} title="Test">
        <span />
      </Modal>,
    );

    await user.click(screen.getByLabelText('Close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not render content when closed', () => {
    render(
      <Modal open={false} onOpenChange={vi.fn()} title="Hidden">
        <p>Hidden content</p>
      </Modal>,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });
});
