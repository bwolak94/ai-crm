import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { TrendingUp } from 'lucide-react';
import type { ScoringHistoryEntry } from '../api/ai.api';

interface ScoreHistoryChartProps {
  history: ScoringHistoryEntry[];
  contactName: string;
}

interface ChartPoint {
  date: string;
  score: number;
  reasoning: string;
  fullDate: string;
}

function scoreColor(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function CustomTooltip(props: TooltipProps<number, string>) {
  const { active, payload } = props as { active?: boolean; payload?: Array<{ payload: ChartPoint }> };
  if (!active || !payload?.length) return null;

  const data = payload[0]!.payload;

  return (
    <div className="max-w-xs rounded-lg border bg-white p-3 shadow-lg">
      <p className="text-xs text-gray-500">{data.fullDate}</p>
      <p className="mt-1 text-lg font-semibold" style={{ color: scoreColor(data.score) }}>
        {data.score}
      </p>
      <p className="mt-1 text-xs text-gray-600 line-clamp-2">{data.reasoning}</p>
    </div>
  );
}

export function ScoreHistoryChart({ history, contactName }: ScoreHistoryChartProps) {
  const { t } = useTranslation('ai');

  const chartData = useMemo((): ChartPoint[] => {
    return history
      .slice()
      .sort((a, b) => new Date(a.scoredAt).getTime() - new Date(b.scoredAt).getTime())
      .map((entry) => {
        const d = new Date(entry.scoredAt);
        return {
          date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          fullDate: d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          score: entry.value,
          reasoning: entry.reasoning,
        };
      });
  }, [history]);

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp size={40} />}
        title={t('scoreHistory.empty')}
        description={t('scoreHistory.emptyDesc', { name: contactName })}
      />
    );
  }

  const latestScore = chartData[chartData.length - 1]!.score;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke={scoreColor(latestScore)}
            strokeWidth={2}
            dot={{ r: 4, fill: scoreColor(latestScore) }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
