import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAiUsage } from '../hooks/useAiUsage';
import { Spinner } from '@/shared/components/ui/Spinner';

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

export function AiUsageDashboard() {
  const { t } = useTranslation('ai');
  const { user } = useAuth();
  const { data, isLoading } = useAiUsage();

  const isAdmin = user?.role === 'admin';

  const chartData = useMemo(
    () =>
      data?.breakdown.map((b) => ({
        name: b.feature,
        tokens: b.tokens,
        cost: b.cost,
      })) ?? [],
    [data],
  );

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">{t('usage.title')}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t('usage.totalTokens')}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatTokens(data.totalTokens)}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{data.period}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t('usage.estimatedCost')}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatCost(data.estimatedCost)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t('usage.features')}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {data.breakdown.length}
          </p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            {t('usage.breakdownTitle')}
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                tickFormatter={formatTokens}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === 'tokens' ? formatTokens(Number(value)) : formatCost(Number(value)),
                  name === 'tokens' ? t('usage.totalTokens') : t('usage.estimatedCost'),
                ]}
              />
              <Bar dataKey="tokens" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
