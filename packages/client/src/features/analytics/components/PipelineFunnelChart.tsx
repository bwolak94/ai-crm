import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface PipelineFunnelChartProps {
  data: { stage: string; count: number; totalValue: number }[];
}

const STAGE_ORDER = ['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

const STAGE_COLORS: Record<string, string> = {
  discovery: '#3b82f6',
  proposal: '#8b5cf6',
  negotiation: '#f59e0b',
  closed_won: '#22c55e',
  closed_lost: '#ef4444',
};

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
  const { t } = useTranslation('pipeline');

  const sorted = STAGE_ORDER
    .map((stage) => {
      const item = data.find((d) => d.stage === stage);
      return {
        name: t(`stages.${stage}`, stage),
        stage,
        count: item?.count ?? 0,
        totalValue: item?.totalValue ?? 0,
        fill: STAGE_COLORS[stage] ?? '#6b7280',
      };
    });

  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        Pipeline by Stage
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={sorted} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            formatter={(value, name) => [
              name === 'totalValue' ? formatCurrency(Number(value)) : value,
              name === 'totalValue' ? 'Value' : 'Deals',
            ]}
          />
          <Bar dataKey="totalValue" radius={[4, 4, 0, 0]}>
            {sorted.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
