import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/shared/i18n';
import { BulkStatusBar } from '../../src/features/contacts/components/BulkStatusBar';

function wrap(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>
    </QueryClientProvider>,
  );
}

describe('BulkStatusBar', () => {
  it('renders nothing when no contacts selected', () => {
    const { container } = wrap(<BulkStatusBar selectedIds={[]} onClear={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows selected count', () => {
    wrap(<BulkStatusBar selectedIds={['a', 'b', 'c']} onClear={vi.fn()} />);

    expect(screen.getByText(/3 selected/i)).toBeInTheDocument();
  });

  it('shows status selector', () => {
    wrap(<BulkStatusBar selectedIds={['a']} onClear={vi.fn()} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows update button', () => {
    wrap(<BulkStatusBar selectedIds={['a']} onClear={vi.fn()} />);

    expect(screen.getByRole('button', { name: /update status/i })).toBeInTheDocument();
  });

  it('calls onClear when close button clicked', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    wrap(<BulkStatusBar selectedIds={['a']} onClear={onClear} />);

    // The X close button
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find((b) => !b.textContent?.includes('Update'));
    await user.click(closeButton!);

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
