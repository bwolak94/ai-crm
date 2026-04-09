import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, StickyNote, CalendarDays, CheckSquare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

interface Activity {
  _id: string;
  type: string;
  title: string;
  contactId: string;
  contactName: string;
  createdAt: string;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

const typeIcons: Record<string, ReactNode> = {
  call: <Phone size={14} />,
  email: <Mail size={14} />,
  note: <StickyNote size={14} />,
  meeting: <CalendarDays size={14} />,
  task: <CheckSquare size={14} />,
};

const typeColors: Record<string, string> = {
  call: 'bg-green-100 text-green-600',
  email: 'bg-blue-100 text-blue-600',
  note: 'bg-amber-100 text-amber-600',
  meeting: 'bg-purple-100 text-purple-600',
  task: 'bg-gray-100 text-gray-600',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const { t } = useTranslation('analytics');
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        {t('recentActivity')}
      </h3>
      <div className="space-y-1">
        {activities.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">
            No recent activities
          </p>
        )}
        {activities.map((activity) => (
          <button
            key={activity._id}
            type="button"
            onClick={() => navigate(`/app/contacts/${activity.contactId}`)}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-gray-50"
          >
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                typeColors[activity.type] ?? 'bg-gray-100 text-gray-600',
              )}
            >
              {typeIcons[activity.type] ?? <StickyNote size={14} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-900">{activity.title}</p>
              <p className="truncate text-xs text-gray-500">
                {activity.contactName}
              </p>
            </div>
            <span className="shrink-0 text-[10px] text-gray-400">
              {timeAgo(activity.createdAt)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
