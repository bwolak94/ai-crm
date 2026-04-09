import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';
import { Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/Badge';
import type { Deal } from '../api/pipeline.api';

interface DealCardProps {
  deal: Deal;
  onClick?: (deal: Deal) => void;
}

const priorityVariant: Record<string, 'info' | 'warning' | 'danger'> = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
};

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getDaysInStage(stageChangedAt?: string, createdAt?: string): number {
  const ref = stageChangedAt ?? createdAt;
  if (!ref) return 0;
  const diff = Date.now() - new Date(ref).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function isAtRisk(expectedCloseDate?: Date | string): boolean {
  if (!expectedCloseDate) return false;
  return new Date(expectedCloseDate) < new Date();
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const { t } = useTranslation('pipeline');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const atRisk = isAtRisk(deal.expectedCloseDate);
  const daysInStage = getDaysInStage(deal.stageChangedAt, deal.createdAt);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(deal)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(deal);
        }
      }}
      data-testid="deal-card"
      className={cn(
        'cursor-grab rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        atRisk && 'border-red-300',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
          {deal.title}
        </h4>
        <Badge variant={priorityVariant[deal.priority]} size="sm">
          {t(`priority.${deal.priority}`)}
        </Badge>
      </div>

      {deal.contactName && (
        <p className="mb-1 text-xs text-gray-500">{deal.contactName}</p>
      )}

      <p className="mb-2 text-sm font-semibold text-gray-800">
        {formatCurrency(deal.value, deal.currency ?? 'USD')}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{t('deal.daysInStage', { count: daysInStage })}</span>
        {deal.expectedCloseDate && (
          <span
            className={cn('flex items-center gap-1', atRisk && 'text-red-500')}
          >
            {atRisk ? (
              <AlertTriangle size={12} />
            ) : (
              <Calendar size={12} />
            )}
            {new Date(deal.expectedCloseDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
