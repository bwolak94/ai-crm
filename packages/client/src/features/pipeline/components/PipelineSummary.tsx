import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { Deal } from '../api/pipeline.api';
import type { DealStage } from '@ai-crm/shared';

interface PipelineSummaryProps {
  deals: Deal[];
}

const ACTIVE_STAGES: DealStage[] = [
  'discovery',
  'proposal',
  'negotiation',
];

const STAGES: DealStage[] = [
  'discovery',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

const stageDotColors: Record<string, string> = {
  discovery: 'bg-blue-400',
  proposal: 'bg-purple-400',
  negotiation: 'bg-amber-400',
  closed_won: 'bg-green-400',
  closed_lost: 'bg-red-400',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function PipelineSummary({ deals }: PipelineSummaryProps) {
  const { t } = useTranslation('pipeline');

  const byStage = STAGES.reduce(
    (acc, stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      acc[stage] = {
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + d.value, 0),
      };
      return acc;
    },
    {} as Record<string, { count: number; value: number }>,
  );

  const activeDeals = deals.filter((d) =>
    ACTIVE_STAGES.includes(d.stage as DealStage),
  );
  const totalActiveValue = activeDeals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-4">
      {STAGES.map((stage) => (
        <div
          key={stage}
          className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2"
        >
          <span
            className={cn('h-2 w-2 rounded-full', stageDotColors[stage])}
          />
          <div className="text-xs">
            <span className="font-medium text-gray-700">
              {t(`stages.${stage}`)}
            </span>
            <span className="ml-2 text-gray-500">
              {byStage[stage].count} · {formatCurrency(byStage[stage].value)}
            </span>
          </div>
        </div>
      ))}

      <div className="ml-auto flex items-center gap-3 border-l pl-4">
        <div className="text-right text-xs">
          <p className="text-gray-500">{t('summary.totalActive')}</p>
          <p className="text-sm font-semibold text-gray-900">
            {activeDeals.length} {t('summary.deals')} ·{' '}
            {formatCurrency(totalActiveValue)}
          </p>
        </div>
      </div>
    </div>
  );
}
