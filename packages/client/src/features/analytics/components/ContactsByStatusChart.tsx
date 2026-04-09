import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from 'recharts';

interface ContactsByStatusChartProps {
  data: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  lead: '#3b82f6',
  prospect: '#f59e0b',
  customer: '#22c55e',
  churned: '#9ca3af',
};

export function ContactsByStatusChart({ data }: ContactsByStatusChartProps) {
  const { t } = useTranslation('contacts');

  const chartData = data.map((d) => ({
    name: t(`status.${d.status}`, d.status),
    value: d.count,
    fill: STATUS_COLORS[d.status] ?? '#6b7280',
  }));

  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        {t('title')} by Status
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
