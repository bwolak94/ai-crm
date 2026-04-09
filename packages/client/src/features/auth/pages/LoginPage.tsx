import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';
import { useAuth } from '../hooks/useAuth';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const switchLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('ai-crm-lang', lng);
  };

  return (
    <div className="flex gap-2">
      {['en', 'pl'].map((lng) => (
        <button
          key={lng}
          onClick={() => switchLanguage(lng)}
          className={`rounded px-2 py-1 text-xs font-medium uppercase transition-colors ${
            i18n.language === lng
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {lng}
        </button>
      ))}
    </div>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const loginMutation = useLogin();

  if (isAuthenticated) {
    return <Navigate to="/app/contacts" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">AI CRM</h1>
          <p className="mt-2 text-gray-600">{t('auth.tagline')}</p>
        </div>
        <div className="rounded-lg bg-white p-8 shadow-md">
          <LoginForm
            onSubmit={(data) => loginMutation.mutate(data)}
            loading={loginMutation.isPending}
            error={loginMutation.error?.message}
          />
          <p className="mt-4 text-center text-sm text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              {t('auth.register')}
            </Link>
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
