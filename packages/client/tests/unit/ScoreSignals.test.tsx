import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/shared/i18n';
import { ScoreSignals } from '../../src/features/ai/components/ScoreSignals';

function wrap(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe('ScoreSignals', () => {
  it('renders positive signals with up arrows', () => {
    wrap(
      <ScoreSignals
        signals={{
          positive: ['Recent email opened', 'Target market match'],
          negative: [],
        }}
      />,
    );

    expect(screen.getByText(/recent email opened/i)).toBeInTheDocument();
    expect(screen.getByText(/target market match/i)).toBeInTheDocument();
  });

  it('renders negative signals with down arrows', () => {
    wrap(
      <ScoreSignals
        signals={{
          positive: [],
          negative: ['No meeting scheduled', 'Low engagement'],
        }}
      />,
    );

    expect(screen.getByText(/no meeting scheduled/i)).toBeInTheDocument();
    expect(screen.getByText(/low engagement/i)).toBeInTheDocument();
  });

  it('renders nothing when no signals', () => {
    const { container } = wrap(
      <ScoreSignals signals={{ positive: [], negative: [] }} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows "+N more" when more than 5 signals', async () => {
    const user = userEvent.setup();
    const signals = Array.from({ length: 8 }, (_, i) => `Signal ${i + 1}`);
    wrap(
      <ScoreSignals signals={{ positive: signals, negative: [] }} />,
    );

    // Only 5 visible initially, "+3 more" button shown
    const moreButton = screen.getByRole('button', { name: /\+3/ });
    expect(moreButton).toBeInTheDocument();

    await user.click(moreButton);

    // All 8 should be visible now (each prefixed with ↑)
    expect(screen.getByText(/Signal 8/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /\+3/ })).not.toBeInTheDocument();
  });
});
