import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '../../src/shared/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<EmptyState title="Empty" description="Try adding some items" />);
    expect(screen.getByText('Try adding some items')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('renders icon', () => {
    render(<EmptyState title="Empty" icon={<span data-testid="icon">!</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders action button and calls onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<EmptyState title="Empty" action={{ label: 'Add Item', onClick }} />);

    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
