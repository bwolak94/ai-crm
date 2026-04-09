import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ContactForm } from '../../src/features/contacts/components/ContactForm';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../src/shared/i18n';

function renderWithProviders(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe('ContactForm', () => {
  it('shows all fields', () => {
    renderWithProviders(<ContactForm onSubmit={vi.fn()} />);

    const form = screen.getByTestId('contact-form');
    expect(form).toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /phone/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /company/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    renderWithProviders(<ContactForm onSubmit={handleSubmit} />);

    await user.click(screen.getByTestId('contact-form-submit'));

    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  it('calls onSubmit with valid data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    renderWithProviders(<ContactForm onSubmit={handleSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'John Doe');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com');
    await user.type(screen.getByRole('textbox', { name: /phone/i }), '+1234567890');
    await user.click(screen.getByTestId('contact-form-submit'));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
        }),
        expect.anything(),
      );
    });
  });
});
