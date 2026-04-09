import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../../src/shared/components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders status as label when no children', () => {
    render(<Badge status="lead" />);
    expect(screen.getByText('lead')).toBeInTheDocument();
  });

  it('maps status to correct variant class', () => {
    const { container } = render(<Badge status="customer" />);
    expect(container.firstChild).toHaveClass('bg-green-100');
  });

  it('maps lead status to info variant', () => {
    const { container } = render(<Badge status="lead" />);
    expect(container.firstChild).toHaveClass('bg-blue-100');
  });

  it('falls back to default for unknown status', () => {
    const { container } = render(<Badge status="unknown-status" />);
    expect(container.firstChild).toHaveClass('bg-gray-100');
  });

  it('uses explicit variant over status', () => {
    const { container } = render(<Badge variant="danger" status="lead">Alert</Badge>);
    expect(container.firstChild).toHaveClass('bg-red-100');
  });

  it('renders dot indicator when dot=true', () => {
    const { container } = render(<Badge variant="success" dot>Online</Badge>);
    const dot = container.querySelector('.rounded-full.bg-green-500');
    expect(dot).toBeInTheDocument();
  });

  it('applies sm size styles', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    expect(container.firstChild).toHaveClass('text-xs');
  });
});
