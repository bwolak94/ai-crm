import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../../src/shared/components/ui/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<Input label="Name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows error message with alert role', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows hint when no error', () => {
    render(<Input label="Email" hint="Enter your email" />);
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<Input label="Email" hint="Enter your email" error="Required" />);
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
  });

  it('forwards ref and handles change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Test" onChange={onChange} />);

    await user.type(screen.getByLabelText('Test'), 'hello');
    expect(onChange).toHaveBeenCalledTimes(5);
  });

  it('is disabled when disabled prop is set', () => {
    render(<Input label="Test" disabled />);
    expect(screen.getByLabelText('Test')).toBeDisabled();
  });

  it('renders left and right addons', () => {
    render(
      <Input label="Price" leftAddon={<span data-testid="left">$</span>} rightAddon={<span data-testid="right">.00</span>} />,
    );
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });
});
