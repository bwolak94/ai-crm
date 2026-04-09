import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ContactsPage } from '@/features/contacts/pages/ContactsPage';
import { ContactDetailPage } from '@/features/contacts/pages/ContactDetailPage';
import { PipelinePage } from '@/features/pipeline/pages/PipelinePage';
import { AiChatPage } from '@/features/ai-chat/pages/AiChatPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/contacts" replace />,
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
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/contacts" replace />,
          },
          {
            path: 'contacts',
            element: <ContactsPage />,
          },
          {
            path: 'contacts/:id',
            element: <ContactDetailPage />,
          },
          {
            path: 'pipeline',
            element: <PipelinePage />,
          },
          {
            path: 'ai-chat',
            element: <AiChatPage />,
          },
        ],
      },
    ],
  },
]);
