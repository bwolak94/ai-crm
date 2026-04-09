import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Users, DollarSign, Brain, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useAnalytics } from '../hooks/useAnalytics';
import { KpiCard } from '../components/KpiCard';
import { ContactsByStatusChart } from '../components/ContactsByStatusChart';
import { PipelineFunnelChart } from '../components/PipelineFunnelChart';
import { AiUsageChart } from '../components/AiUsageChart';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import type { AnalyticsData } from '../api/analytics.api';

const DATE_RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
] as const;

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

function exportToCsv(data: AnalyticsData): void {
  const rows: string[] = [];

  rows.push('Section,Key,Value');
  rows.push(`KPI,Total Contacts,${data.kpis.totalContacts}`);
  rows.push(`KPI,New This Month,${data.kpis.newContactsThisMonth}`);
  rows.push(`KPI,Total Deals,${data.kpis.totalDeals}`);
  rows.push(`KPI,Pipeline Value,${data.kpis.pipelineValue}`);
  rows.push(`KPI,Avg AI Score,${data.kpis.avgAiScore}`);
  rows.push(`KPI,At Risk,${data.kpis.contactsAtRisk}`);

  rows.push('');
  rows.push('Status,Count');
  data.contactsByStatus.forEach((s) => rows.push(`${s.status},${s.count}`));

  rows.push('');
  rows.push('Stage,Count,Total Value');
  data.dealsByStage.forEach((s) =>
    rows.push(`${s.stage},${s.count},${s.totalValue}`),
  );

  rows.push('');
  rows.push('Date,AI Calls,Tokens Used,Estimated Cost');
  data.aiUsageLast30Days.forEach((d) =>
    rows.push(`${d.date},${d.calls},${d.tokensUsed},${d.estimatedCost}`),
  );

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AnalyticsPage() {
  const { t } = useTranslation('analytics');
  const [days, setDays] = useState(30);
  const { data, isLoading } = useAnalytics(days);

  const handleExport = useCallback(() => {
    if (data) exportToCsv(data);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border bg-white">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => setDays(range.value)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    days === range.value
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  } first:rounded-l-lg last:rounded-r-lg`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download size={14} />
              {t('export')}
            </Button>
          </div>
        }
      />

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('kpi.totalContacts')}
          value={data.kpis.totalContacts}
          icon={<Users size={18} />}
        />
        <KpiCard
          label={t('kpi.pipelineValue')}
          value={formatCurrency(data.kpis.pipelineValue)}
          icon={<DollarSign size={18} />}
        />
        <KpiCard
          label={t('kpi.avgAiScore')}
          value={data.kpis.avgAiScore}
          icon={<Brain size={18} />}
        />
        <KpiCard
          label={t('kpi.atRisk')}
          value={data.kpis.contactsAtRisk}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ContactsByStatusChart data={data.contactsByStatus} />
        </div>
        <div className="lg:col-span-3">
          <PipelineFunnelChart data={data.dealsByStage} />
        </div>
      </div>

      {/* Row 3: AI Usage + Activity Feed */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AiUsageChart data={data.aiUsageLast30Days} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivityFeed activities={data.recentActivities} />
        </div>
      </div>
    </div>
  );
}
