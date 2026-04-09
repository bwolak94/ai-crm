import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { DealCard } from './DealCard';
import type { Deal } from '../api/pipeline.api';
import type { DealStage } from '@ai-crm/shared';

interface PipelineColumnProps {
  stage: DealStage;
  deals: Deal[];
  onDealClick?: (deal: Deal) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(value);
}

const stageColors: Record<string, string> = {
  discovery: 'border-t-blue-400',
  proposal: 'border-t-purple-400',
  negotiation: 'border-t-amber-400',
  closed_won: 'border-t-green-400',
  closed_lost: 'border-t-red-400',
};

const stageDropBg: Record<string, string> = {
  discovery: 'bg-blue-50',
  proposal: 'bg-purple-50',
  negotiation: 'bg-amber-50',
  closed_won: 'bg-green-50',
  closed_lost: 'bg-red-50',
};

export function PipelineColumn({
  stage,
  deals,
  onDealClick,
}: PipelineColumnProps) {
  const { t } = useTranslation('pipeline');
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className={cn(
        'flex min-w-[280px] flex-1 flex-col rounded-lg border border-t-4 bg-gray-50 transition-colors',
        stageColors[stage],
        isOver && stageDropBg[stage],
      )}
    >
      <div className="border-b px-3 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            {t(`stages.${stage}`)}
          </h3>
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
            {deals.length}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {formatCurrency(totalValue)}
        </p>
      </div>

      <SortableContext
        items={deals.map((d) => d._id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex flex-1 flex-col gap-2 overflow-y-auto p-2"
          style={{ minHeight: 120 }}
        >
          {deals.map((deal) => (
            <DealCard key={deal._id} deal={deal} onClick={onDealClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
