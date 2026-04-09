import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ContactCreateSchema, type ContactCreate } from '@ai-crm/shared';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';

interface ContactFormProps {
  onSubmit: (data: ContactCreate) => void;
  defaultValues?: Partial<ContactCreate>;
  loading?: boolean;
}

export function ContactForm({ onSubmit, defaultValues, loading }: ContactFormProps) {
  const { t } = useTranslation('contacts');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactCreate>({
    resolver: zodResolver(ContactCreateSchema),
    defaultValues: {
      status: 'lead',
      tags: [],
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="contact-form">
      <Input
        label={t('fields.name')}
        error={errors.name?.message}
        required
        {...register('name')}
      />
      <Input
        label={t('fields.email')}
        type="email"
        error={errors.email?.message}
        required
        {...register('email')}
      />
      <Input
        label={t('fields.phone')}
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Input
        label={t('fields.company')}
        error={errors.company?.message}
        {...register('company')}
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('fields.status')}
        </label>
        <select
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register('status')}
        >
          <option value="lead">{t('status.lead')}</option>
          <option value="prospect">{t('status.prospect')}</option>
          <option value="customer">{t('status.customer')}</option>
          <option value="churned">{t('status.churned')}</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} data-testid="contact-form-submit">
          {tCommon('actions.save')}
        </Button>
      </div>
    </form>
  );
}
