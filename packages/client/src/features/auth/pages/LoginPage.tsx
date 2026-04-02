import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

export function LoginPage() {
  const { t } = useTranslation();
  const loginMutation = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">AI CRM</h1>
          <p className="mt-2 text-gray-600">{t('auth.login')}</p>
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
      </div>
    </div>
  );
}
