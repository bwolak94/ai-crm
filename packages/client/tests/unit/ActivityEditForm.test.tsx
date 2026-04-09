import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/shared/i18n';
import { ActivityEditForm } from '../../src/features/activities/components/ActivityEditForm';
import type { Activity } from '../../src/features/activities/api/activities.api';

function wrap(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

const mockActivity: Activity = {
  _id: '1',
  contactId: 'c1',
  ownerId: 'o1',
  type: 'note',
  title: 'Meeting notes',
  body: 'Discussed pricing options.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ActivityEditForm', () => {
  it('renders with pre-filled values', () => {
    wrap(<ActivityEditForm activity={mockActivity} onSubmit={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue('Meeting notes');
    expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue('Discussed pricing options.');
  });

  it('shows type selector with current value', () => {
    wrap(<ActivityEditForm activity={mockActivity} onSubmit={vi.fn()} />);

    const select = screen.getByRole('combobox', { name: /type/i });
    expect(select).toHaveValue('note');
  });

  it('allows editing the title', async () => {
    const user = userEvent.setup();
    wrap(<ActivityEditForm activity={mockActivity} onSubmit={vi.fn()} />);

    const titleInput = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');

    expect(titleInput).toHaveValue('Updated title');
  });

  it('submits form with existing values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    wrap(<ActivityEditForm activity={mockActivity} onSubmit={onSubmit} />);

    // Modify title to trigger dirty state
    const titleInput = screen.getByRole('textbox', { name: /title/i });
    await user.type(titleInput, ' updated');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state on submit button', () => {
    wrap(<ActivityEditForm activity={mockActivity} onSubmit={vi.fn()} loading />);

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('renders all form fields', () => {
    wrap(<ActivityEditForm activity={mockActivity} onSubmit={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: /type/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
  });
});
