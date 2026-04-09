import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from '../../src/shared/components/ui/Spinner';

describe('Spinner', () => {
  it('renders with status role for accessibility', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<Spinner />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('applies default md size', () => {
    render(<Spinner />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveClass('h-6', 'w-6');
  });

  it('applies sm size', () => {
    render(<Spinner size="sm" />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('applies lg size', () => {
    render(<Spinner size="lg" />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('applies custom className', () => {
    render(<Spinner className="text-blue-500" />);
    expect(screen.getByRole('status')).toHaveClass('text-blue-500');
  });

  it('has animate-spin class', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveClass('animate-spin');
  });
});
