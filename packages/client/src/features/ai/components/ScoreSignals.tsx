import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ScoreSignalsProps {
  signals: { positive: string[]; negative: string[] };
}

const MAX_VISIBLE = 5;

function SignalList({
  items,
  type,
}: {
  items: string[];
  type: 'positive' | 'negative';
}) {
  const { t } = useTranslation('ai');
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? items : items.slice(0, MAX_VISIBLE);
  const remaining = items.length - MAX_VISIBLE;

  const isPositive = type === 'positive';

  return (
    <div>
      <h4
        className={cn(
          'mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide',
          isPositive ? 'text-green-700' : 'text-red-700',
        )}
      >
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {t(`signals.${type}`)}
        <span className="text-gray-400">({items.length})</span>
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((signal, i) => (
          <span
            key={i}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              isPositive
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700',
            )}
          >
            {isPositive ? '↑' : '↓'} {signal}
          </span>
        ))}
        {!expanded && remaining > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
          >
            +{remaining} {t('signals.more')}
          </button>
        )}
      </div>
    </div>
  );
}

export function ScoreSignals({ signals }: ScoreSignalsProps) {
  const hasSignals =
    signals.positive.length > 0 || signals.negative.length > 0;

  if (!hasSignals) return null;

  return (
    <div className="space-y-4">
      {signals.positive.length > 0 && (
        <SignalList items={signals.positive} type="positive" />
      )}
      {signals.negative.length > 0 && (
        <SignalList items={signals.negative} type="negative" />
      )}
    </div>
  );
}
