import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/shared/i18n';
import { RecommendedAction } from '../../src/features/ai/components/RecommendedAction';

function wrap(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe('RecommendedAction', () => {
  it('renders action text', () => {
    wrap(<RecommendedAction action="Schedule a demo call this week" />);

    expect(screen.getByText('Schedule a demo call this week')).toBeInTheDocument();
  });

  it('renders title', () => {
    wrap(<RecommendedAction action="Follow up" />);

    expect(screen.getByText('Recommended Action')).toBeInTheDocument();
  });

  it('shows log activity button when callback provided', () => {
    wrap(<RecommendedAction action="Test" onLogActivity={vi.fn()} />);

    expect(screen.getByText('Log activity')).toBeInTheDocument();
  });

  it('calls onLogActivity when clicked', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    wrap(<RecommendedAction action="Test" onLogActivity={onLog} />);

    await user.click(screen.getByText('Log activity'));
    expect(onLog).toHaveBeenCalledTimes(1);
  });

  it('does not show log button when no callback', () => {
    wrap(<RecommendedAction action="Test" />);

    expect(screen.queryByText('Log activity')).not.toBeInTheDocument();
  });
});
