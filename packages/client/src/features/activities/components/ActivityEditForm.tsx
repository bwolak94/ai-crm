import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { ActivityUpdate } from '@ai-crm/shared';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';
import type { Activity } from '../api/activities.api';

interface ActivityEditFormProps {
  activity: Activity;
  onSubmit: (data: ActivityUpdate) => void;
  loading?: boolean;
}

export function ActivityEditForm({ activity, onSubmit, loading }: ActivityEditFormProps) {
  const { t } = useTranslation('activities');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityUpdate>({
    defaultValues: {
      type: activity.type,
      title: activity.title,
      body: activity.body ?? '',
      scheduledAt: activity.scheduledAt
        ? new Date(activity.scheduledAt as unknown as string).toISOString().slice(0, 16)
        : undefined,
    } as Record<string, unknown>,
  });

  const typeOptions = [
    { value: 'call', label: t('types.call') },
    { value: 'email', label: t('types.email') },
    { value: 'note', label: t('types.note') },
    { value: 'meeting', label: t('types.meeting') },
    { value: 'task', label: t('types.task') },
  ];

  const handleFormSubmit = (data: ActivityUpdate) => {
    const cleaned = { ...data };
    if (!cleaned.scheduledAt) delete cleaned.scheduledAt;
    if (!cleaned.body) delete cleaned.body;
    onSubmit(cleaned);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Select
        label={t('fields.type')}
        options={typeOptions}
        error={errors.type?.message}
        {...register('type')}
      />
      <Input
        label={t('fields.title')}
        error={errors.title?.message}
        required
        {...register('title')}
      />
      <Textarea
        label={t('fields.body')}
        error={errors.body?.message}
        {...register('body')}
      />
      <Input
        label={t('fields.scheduledAt')}
        type="datetime-local"
        {...register('scheduledAt')}
      />
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {tCommon('actions.save')}
        </Button>
      </div>
    </form>
  );
}
