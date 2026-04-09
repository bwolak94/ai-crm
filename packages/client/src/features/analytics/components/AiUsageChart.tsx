import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AiUsageChartProps {
  data: { date: string; calls: number; tokensUsed: number; estimatedCost: number }[];
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function AiUsageChart({ data }: AiUsageChartProps) {
  const { t } = useTranslation('ai');

  const chartData = data.map((d) => ({
    ...d,
    shortDate: new Date(d.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        {t('usage.title')}
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="shortDate"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            tickFormatter={formatTokens}
          />
          <Tooltip
            formatter={(value, name) => [
              name === 'tokensUsed' ? formatTokens(Number(value)) : value,
              name === 'tokensUsed' ? 'Tokens' : 'API Calls',
            ]}
          />
          <Area
            type="monotone"
            dataKey="tokensUsed"
            stroke="#8b5cf6"
            fill="url(#aiGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
