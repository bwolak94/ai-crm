import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, StickyNote, CalendarDays, CheckSquare, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/Badge';
import { Spinner } from '@/shared/components/ui/Spinner';
import type { Activity } from '../api/activities.api';
import type { ReactNode } from 'react';

interface ActivityListProps {
  activities: Activity[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const typeIcons: Record<string, ReactNode> = {
  call: <Phone size={16} />,
  email: <Mail size={16} />,
  note: <StickyNote size={16} />,
  meeting: <CalendarDays size={16} />,
  task: <CheckSquare size={16} />,
};

const typeColors: Record<string, string> = {
  call: 'bg-green-100 text-green-600',
  email: 'bg-blue-100 text-blue-600',
  note: 'bg-amber-100 text-amber-600',
  meeting: 'bg-purple-100 text-purple-600',
  task: 'bg-gray-100 text-gray-600',
};

const typeBadgeVariant: Record<string, 'success' | 'info' | 'warning' | 'default' | 'danger'> = {
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

export function ActivityList({ activities, loading, onDelete }: ActivityListProps) {
  const { t } = useTranslation('activities');
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        {t('empty')}
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="activity-list">
      {activities.map((activity) => (
        <div
          key={activity._id}
          className="flex items-start gap-3 rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm"
          data-testid="activity-list-item"
        >
          <div
            className={cn(
              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              typeColors[activity.type] ?? 'bg-gray-100 text-gray-600',
            )}
          >
            {typeIcons[activity.type] ?? <StickyNote size={16} />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
              <Badge variant={typeBadgeVariant[activity.type]} size="sm">
                {t(`types.${activity.type}`)}
              </Badge>
            </div>
            {activity.contactName && (
              <button
                type="button"
                onClick={() => navigate(`/app/contacts/${activity.contactId}`)}
                className="mt-0.5 text-xs text-blue-600 hover:underline"
              >
                {activity.contactName}
              </button>
            )}
            {activity.body && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{activity.body}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">{formatDate(activity.createdAt)}</p>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(activity._id)}
              className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label={t('delete')}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
