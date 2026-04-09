import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KpiCard } from '../../src/features/analytics/components/KpiCard';

describe('KpiCard', () => {
  it('renders label and numeric value', () => {
    render(<KpiCard label="Total Contacts" value={1234} />);

    expect(screen.getByText('Total Contacts')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders string value as-is', () => {
    render(<KpiCard label="Pipeline" value="$45,000" />);

    expect(screen.getByText('$45,000')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<KpiCard label="Test" value={5} icon={<span data-testid="icon">!</span>} />);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('shows upward trend in green', () => {
    render(<KpiCard label="Growth" value={100} trend={{ value: 12, direction: 'up' }} />);

    const trend = screen.getByText('12%');
    expect(trend).toBeInTheDocument();
    expect(trend.closest('div')).toHaveClass('text-green-600');
  });

  it('shows downward trend in red', () => {
    render(<KpiCard label="Churn" value={5} trend={{ value: 8, direction: 'down' }} />);

    const trend = screen.getByText('8%');
    expect(trend).toBeInTheDocument();
    expect(trend.closest('div')).toHaveClass('text-red-600');
  });

  it('does not show trend when not provided', () => {
    const { container } = render(<KpiCard label="Simple" value={10} />);

    expect(container.querySelector('.text-green-600')).not.toBeInTheDocument();
    expect(container.querySelector('.text-red-600')).not.toBeInTheDocument();
  });
});
