import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from '../../src/shared/components/ui/Avatar';

describe('Avatar', () => {
  it('shows initials from single name', () => {
    render(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('shows initials from full name', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows initials from three-word name (first two)', () => {
    render(<Avatar name="John William Doe" />);
    expect(screen.getByText('JW')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<Avatar name="Jane Smith" />);
    expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
  });

  it('renders image when src provided', () => {
    render(<Avatar name="Jane" src="https://example.com/photo.jpg" />);
    const img = screen.getByAltText('Jane');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('applies sm size', () => {
    render(<Avatar name="Test" size="sm" />);
    expect(screen.getByLabelText('Test')).toHaveClass('h-8', 'w-8');
  });

  it('applies lg size', () => {
    render(<Avatar name="Test" size="lg" />);
    expect(screen.getByLabelText('Test')).toHaveClass('h-12', 'w-12');
  });

  it('generates deterministic color for same name', () => {
    const { container: c1 } = render(<Avatar name="Alice" />);
    const { container: c2 } = render(<Avatar name="Alice" />);

    const classes1 = (c1.firstChild as HTMLElement).className;
    const classes2 = (c2.firstChild as HTMLElement).className;
    expect(classes1).toBe(classes2);
  });

  it('applies custom className', () => {
    render(<Avatar name="Test" className="ring-2" />);
    expect(screen.getByLabelText('Test')).toHaveClass('ring-2');
  });
});
