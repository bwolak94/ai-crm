import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '../components/RegisterForm';
import { useRegister } from '../hooks/useRegister';

export function RegisterPage() {
  const { t } = useTranslation();
  const registerMutation = useRegister();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">AI CRM</h1>
          <p className="mt-2 text-gray-600">{t('auth.register')}</p>
        </div>
        <div className="rounded-lg bg-white p-8 shadow-md">
          <RegisterForm
            onSubmit={(data) => registerMutation.mutate(data)}
            loading={registerMutation.isPending}
            error={registerMutation.error?.message}
          />
          <p className="mt-4 text-center text-sm text-gray-600">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
