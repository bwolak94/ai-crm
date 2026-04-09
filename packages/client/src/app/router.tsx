import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ContactsPage } from '@/features/contacts/pages/ContactsPage';
import { ContactDetailPage } from '@/features/contacts/pages/ContactDetailPage';
import { PipelinePage } from '@/features/pipeline/pages/PipelinePage';
import { AiChatPage } from '@/features/ai-chat/pages/AiChatPage';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';
import { ActivitiesPage } from '@/features/activities/pages/ActivitiesPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

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
            element: <Navigate to="/app/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <AnalyticsPage />,
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
            path: 'activities',
            element: <ActivitiesPage />,
          },
          {
            path: 'ai-chat',
            element: <AiChatPage />,
          },
          {
            path: 'analytics',
            element: <AnalyticsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);
