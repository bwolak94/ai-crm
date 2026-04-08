import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@/shared/lib/queryClient';
import i18n from '@/shared/i18n';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { router } from './router';

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
