import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { AuthRegisterSchema, type AuthRegister } from '@ai-crm/shared';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

interface RegisterFormProps {
  onSubmit: (data: AuthRegister) => void;
  loading?: boolean;
  error?: string;
}

export function RegisterForm({ onSubmit, loading, error }: RegisterFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthRegister>({
    resolver: zodResolver(AuthRegisterSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <Input
        label={t('auth.name')}
        type="text"
        placeholder={t('auth.namePlaceholder')}
        error={errors.name?.message}
        required
        {...register('name')}
      />
      <Input
        label={t('auth.email')}
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        required
        {...register('email')}
      />
      <Input
        label={t('auth.password')}
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        required
        {...register('password')}
      />
      <Button type="submit" loading={loading} className="w-full">
        {t('auth.register')}
      </Button>
    </form>
  );
}
