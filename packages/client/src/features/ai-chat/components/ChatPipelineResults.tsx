import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';

interface StageData {
  stage: string;
  count: number;
  totalValue: number;
}

interface ChatPipelineResultsProps {
  stages: StageData[];
}

const stageColors: Record<string, string> = {
  discovery: 'bg-blue-100 text-blue-800',
  proposal: 'bg-purple-100 text-purple-800',
  negotiation: 'bg-amber-100 text-amber-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ChatPipelineResults({ stages }: ChatPipelineResultsProps) {
  const { t } = useTranslation('pipeline');

  if (stages.length === 0) return null;

  const total = stages.reduce((sum, s) => sum + s.totalValue, 0);
  const totalCount = stages.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="mt-2 overflow-hidden rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 font-medium text-gray-600">
              {t('deal.stage')}
            </th>
            <th className="px-3 py-2 text-right font-medium text-gray-600">
              Deals
            </th>
            <th className="px-3 py-2 text-right font-medium text-gray-600">
              {t('deal.value')}
            </th>
          </tr>
        </thead>
        <tbody>
          {stages.map((stage) => (
            <tr key={stage.stage} className="border-t">
              <td className="px-3 py-2">
                <span
                  className={cn(
                    'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                    stageColors[stage.stage] ?? 'bg-gray-100 text-gray-800',
                  )}
                >
                  {t(`stages.${stage.stage}`, stage.stage)}
                </span>
              </td>
              <td className="px-3 py-2 text-right text-gray-700">
                {stage.count}
              </td>
              <td className="px-3 py-2 text-right font-medium text-gray-900">
                {formatCurrency(stage.totalValue)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t bg-gray-50">
          <tr>
            <td className="px-3 py-2 font-semibold text-gray-900">Total</td>
            <td className="px-3 py-2 text-right font-semibold text-gray-900">
              {totalCount}
            </td>
            <td className="px-3 py-2 text-right font-semibold text-gray-900">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
