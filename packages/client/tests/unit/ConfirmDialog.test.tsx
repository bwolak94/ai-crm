import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from '../../src/shared/components/ui/ConfirmDialog';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/shared/i18n';

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe('ConfirmDialog', () => {
  it('renders title and message when open', () => {
    renderWithI18n(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete Contact"
        message="Are you sure?"
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText('Delete Contact')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders cancel and confirm buttons', () => {
    renderWithI18n(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete"
        message="Sure?"
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('uses custom confirm label', () => {
    renderWithI18n(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Confirm"
        message="Continue?"
        confirmLabel="Yes, proceed"
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText('Yes, proceed')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithI18n(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete"
        message="Sure?"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) when cancel clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithI18n(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Delete"
        message="Sure?"
        onConfirm={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not render when closed', () => {
    renderWithI18n(
      <ConfirmDialog
        open={false}
        onOpenChange={vi.fn()}
        title="Hidden"
        message="Nope"
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });
});
