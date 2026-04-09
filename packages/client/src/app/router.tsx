import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ContactsPage } from '@/features/contacts/pages/ContactsPage';
import { ContactDetailPage } from '@/features/contacts/pages/ContactDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/contacts" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/contacts',
            element: <ContactsPage />,
          },
          {
            path: '/contacts/:id',
            element: <ContactDetailPage />,
          },
        ],
      },
    ],
  },
]);
