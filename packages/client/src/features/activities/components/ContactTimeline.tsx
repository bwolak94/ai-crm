import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  Mail,
  StickyNote,
  CalendarDays,
  CheckSquare,
  Plus,
  Trash2,
  Check,
  Pencil,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useContactActivities } from '../hooks/useActivities';
import { useCreateActivity, useDeleteActivity, useUpdateActivity } from '../hooks/useActivityMutations';
import { ActivityForm } from './ActivityForm';
import { ActivityEditForm } from './ActivityEditForm';
import type { Activity } from '../api/activities.api';
import type { ReactNode } from 'react';

interface ContactTimelineProps {
  contactId: string;
}

const typeIcons: Record<string, ReactNode> = {
  call: <Phone size={14} />,
  email: <Mail size={14} />,
  note: <StickyNote size={14} />,
  meeting: <CalendarDays size={14} />,
  task: <CheckSquare size={14} />,
};

const typeColors: Record<string, string> = {
  call: 'bg-green-100 text-green-600 border-green-200',
  email: 'bg-blue-100 text-blue-600 border-blue-200',
  note: 'bg-amber-100 text-amber-600 border-amber-200',
  meeting: 'bg-purple-100 text-purple-600 border-purple-200',
  task: 'bg-gray-100 text-gray-600 border-gray-200',
};

const typeBadgeVariant: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  call: 'success',
  email: 'info',
  note: 'warning',
  meeting: 'default',
  task: 'default',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimelineItem({
  activity,
  onEdit,
  onDelete,
  onComplete,
}: {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  onComplete?: (id: string) => void;
}) {
  const { t } = useTranslation('activities');
  const isTask = activity.type === 'task';
  const isCompleted = !!activity.completedAt;

  return (
    <div className="relative flex gap-3 pb-6 last:pb-0">
      <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-gray-200 last:hidden" />

      <div
        className={cn(
          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
          typeColors[activity.type] ?? 'bg-gray-100 text-gray-600 border-gray-200',
        )}
      >
        {typeIcons[activity.type] ?? <StickyNote size={14} />}
      </div>

      <div className="min-w-0 flex-1 rounded-lg border bg-white p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-medium text-gray-900', isCompleted && 'line-through text-gray-400')}>
                {activity.title}
              </span>
              <Badge variant={typeBadgeVariant[activity.type]} size="sm">
                {t(`types.${activity.type}`)}
              </Badge>
              {isTask && isCompleted && (
                <Badge variant="success" size="sm">
                  {t('completed')}
                </Badge>
              )}
            </div>
            {activity.body && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-3">{activity.body}</p>
            )}
            {activity.scheduledAt && (
              <p className="mt-1 text-xs text-gray-400">
                {t('fields.scheduledAt')}: {formatDate(activity.scheduledAt as unknown as string)}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">{formatDate(activity.createdAt)}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {isTask && !isCompleted && onComplete && (
              <button
                type="button"
                onClick={() => onComplete(activity._id)}
                className="rounded-md p-1 text-gray-400 hover:bg-green-50 hover:text-green-500"
                title={t('markComplete')}
              >
                <Check size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(activity)}
              className="rounded-md p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-500"
              title={t('edit')}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(activity._id)}
              className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              title={t('delete')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactTimeline({ contactId }: ContactTimelineProps) {
  const { t } = useTranslation('activities');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const { data, isLoading } = useContactActivities(contactId);
  const createMutation = useCreateActivity();
  const deleteMutation = useDeleteActivity();
  const updateMutation = useUpdateActivity();

  const activities = data?.items ?? [];

  const handleComplete = (id: string) => {
    updateMutation.mutate({ id, data: { completedAt: new Date() } });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button variant="secondary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={14} />
          {t('form.createTitle')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      )}

      {!isLoading && activities.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">{t('empty')}</p>
      )}

      {!isLoading && activities.length > 0 && (
        <div className="space-y-0">
          {activities.map((activity) => (
            <TimelineItem
              key={activity._id}
              activity={activity}
              onEdit={setEditingActivity}
              onDelete={(id) => deleteMutation.mutate(id)}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      <Modal open={createOpen} onOpenChange={setCreateOpen} title={t('form.createTitle')} size="lg">
        <ActivityForm
          defaultContactId={contactId}
          onSubmit={(data) => {
            createMutation.mutate(data, { onSuccess: () => setCreateOpen(false) });
          }}
          loading={createMutation.isPending}
        />
      </Modal>

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
