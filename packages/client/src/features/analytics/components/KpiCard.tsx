import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
}

function formatValue(val: string | number): string {
  if (typeof val === 'string') return val;
  return new Intl.NumberFormat('en-US').format(val);
}

export function KpiCard({ label, value, icon, trend }: KpiCardProps) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {formatValue(value)}
      </p>
      {trend && (
        <div
          className={cn(
            'mt-1 flex items-center gap-1 text-xs font-medium',
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600',
          )}
        >
          {trend.direction === 'up' ? (
            <TrendingUp size={14} />
          ) : (
            <TrendingDown size={14} />
          )}
          {trend.value}%
        </div>
      )}
    </div>
  );
}
