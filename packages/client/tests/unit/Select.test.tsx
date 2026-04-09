import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Select } from '../../src/shared/components/ui/Select';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C', disabled: true },
];

describe('Select', () => {
  it('renders with label and options', () => {
    render(<Select label="Status" options={options} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('renders placeholder option', () => {
    render(<Select label="Pick" options={options} placeholder="Choose one" />);
    expect(screen.getByText('Choose one')).toBeInTheDocument();
  });

  it('shows error message with alert role', () => {
    render(<Select label="Test" options={options} error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('shows hint when no error', () => {
    render(<Select label="Test" options={options} hint="Pick one" />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('hides hint when error present', () => {
    render(<Select label="Test" options={options} hint="Pick one" error="Required" />);
    expect(screen.queryByText('Pick one')).not.toBeInTheDocument();
  });

  it('handles value change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select label="Status" options={options} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText('Status'), 'b');
    expect(onChange).toHaveBeenCalled();
  });

  it('disables individual options', () => {
    render(<Select label="Status" options={options} />);
    const opt = screen.getByText('Option C').closest('option');
    expect(opt).toBeDisabled();
  });

  it('is disabled when disabled prop is set', () => {
    render(<Select label="Test" options={options} disabled />);
    expect(screen.getByLabelText('Test')).toBeDisabled();
  });

  it('shows required indicator', () => {
    render(<Select label="Test" options={options} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
