import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { LoginSchema, type Login } from '@ai-crm/shared';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (data: Login) => void;
  loading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Login>({
    resolver: zodResolver(LoginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate data-testid="login-form">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert" data-testid="login-error">
          {t(error)}
        </div>
      )}
      <Input
        label={t('auth.email')}
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        required
        {...register('email')}
      />
      <div className="relative">
        <Input
          label={t('auth.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          required
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
          aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <Button type="submit" loading={loading} className="w-full" data-testid="login-submit">
        {t('auth.login')}
      </Button>
    </form>
  );
}
