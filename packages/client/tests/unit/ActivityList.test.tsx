import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/shared/i18n';
import { ActivityList } from '../../src/features/activities/components/ActivityList';
import type { Activity } from '../../src/features/activities/api/activities.api';

function wrap(ui: React.ReactElement) {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
    </MemoryRouter>,
  );
}

const mockActivities: Activity[] = [
  {
    _id: '1',
    contactId: 'c1',
    contactName: 'John Doe',
    ownerId: 'o1',
    type: 'call',
    title: 'Sales call',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    contactId: 'c2',
    contactName: 'Jane Smith',
    ownerId: 'o1',
    type: 'email',
    title: 'Follow-up email',
    body: 'Sent proposal attachment',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('ActivityList', () => {
  it('renders activities', () => {
    wrap(<ActivityList activities={mockActivities} />);

    expect(screen.getByText('Sales call')).toBeInTheDocument();
    expect(screen.getByText('Follow-up email')).toBeInTheDocument();
  });

  it('shows contact names', () => {
    wrap(<ActivityList activities={mockActivities} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows activity body text', () => {
    wrap(<ActivityList activities={mockActivities} />);

    expect(screen.getByText('Sent proposal attachment')).toBeInTheDocument();
  });

  it('shows type badges', () => {
    wrap(<ActivityList activities={mockActivities} />);

    expect(screen.getByText('Call')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows empty state when no activities', () => {
    wrap(<ActivityList activities={[]} />);

    expect(screen.getByText(/no activities/i)).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    wrap(<ActivityList activities={[]} loading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    wrap(<ActivityList activities={mockActivities} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]!);

    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('renders data-testid attributes', () => {
    wrap(<ActivityList activities={mockActivities} />);

    expect(screen.getByTestId('activity-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('activity-list-item')).toHaveLength(2);
  });

  it('shows edit buttons when onEdit provided', () => {
    wrap(<ActivityList activities={mockActivities} onEdit={vi.fn()} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons).toHaveLength(2);
  });

  it('calls onEdit with activity when edit button clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    wrap(<ActivityList activities={mockActivities} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]!);

    expect(onEdit).toHaveBeenCalledWith(mockActivities[0]);
  });

  it('does not show edit buttons when onEdit not provided', () => {
    wrap(<ActivityList activities={mockActivities} />);

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });
});
