import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Textarea } from '../../src/shared/components/ui/Textarea';

describe('Textarea', () => {
  it('renders with label', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Textarea label="Notes" error="Too short" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
  });

  it('sets aria-invalid when error present', () => {
    render(<Textarea label="Notes" error="Required" />);
    expect(screen.getByLabelText('Notes')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows hint when no error', () => {
    render(<Textarea label="Notes" hint="Optional" />);
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('shows character count when showCount and maxLength set', () => {
    render(<Textarea label="Bio" showCount maxLength={200} value="Hello" onChange={() => {}} />);
    expect(screen.getByText('5/200')).toBeInTheDocument();
  });

  it('handles typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea label="Notes" onChange={onChange} />);

    await user.type(screen.getByLabelText('Notes'), 'test');
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it('is disabled when disabled prop set', () => {
    render(<Textarea label="Notes" disabled />);
    expect(screen.getByLabelText('Notes')).toBeDisabled();
  });

  it('shows required indicator', () => {
    render(<Textarea label="Notes" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
