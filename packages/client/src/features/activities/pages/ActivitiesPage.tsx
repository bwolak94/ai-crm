import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Pagination } from '@/shared/components/ui/Pagination';
import { ActivityList } from '../components/ActivityList';
import { ActivityForm } from '../components/ActivityForm';
import { ActivityEditForm } from '../components/ActivityEditForm';
import { useActivities } from '../hooks/useActivities';
import { useCreateActivity, useDeleteActivity, useUpdateActivity } from '../hooks/useActivityMutations';
import type { Activity } from '../api/activities.api';
import type { ActivityType } from '@ai-crm/shared';

const ACTIVITY_TYPES: Array<{ value: string; labelKey: string }> = [
  { value: '', labelKey: 'filters.all' },
  { value: 'call', labelKey: 'types.call' },
  { value: 'email', labelKey: 'types.email' },
  { value: 'note', labelKey: 'types.note' },
  { value: 'meeting', labelKey: 'types.meeting' },
  { value: 'task', labelKey: 'types.task' },
];

export function ActivitiesPage() {
  const { t } = useTranslation('activities');
  const { t: tCommon } = useTranslation('common');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const filters = {
    page,
    limit: 20,
    ...(typeFilter ? { type: typeFilter as ActivityType } : {}),
  };

  const { data, isLoading } = useActivities(filters);
  const createMutation = useCreateActivity();
  const deleteMutation = useDeleteActivity();
  const updateMutation = useUpdateActivity();

  const activities = data?.items ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        actions={
          <Button onClick={() => setCreateOpen(true)} data-testid="create-activity-btn">
            <Plus size={16} />
            {tCommon('actions.create')}
          </Button>
        }
      />

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-1">
        {ACTIVITY_TYPES.map(({ value, labelKey }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTypeFilter(value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              typeFilter === value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <ActivityList
        activities={activities}
        loading={isLoading}
        onDelete={(id) => deleteMutation.mutate(id)}
        onEdit={setEditingActivity}
      />

      {data && data.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t('form.createTitle')}
        size="lg"
      >
        <ActivityForm
          onSubmit={(data) => {
            createMutation.mutate(data, {
              onSuccess: () => setCreateOpen(false),
            });
          }}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        open={!!editingActivity}
        onOpenChange={(open) => { if (!open) setEditingActivity(null); }}
        title={t('form.editTitle')}
        size="lg"
      >
        {editingActivity && (
          <ActivityEditForm
            activity={editingActivity}
            onSubmit={(data) => {
              updateMutation.mutate(
                { id: editingActivity._id, data },
                { onSuccess: () => setEditingActivity(null) },
              );
            }}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
