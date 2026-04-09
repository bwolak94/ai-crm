import { useTranslation } from 'react-i18next';
import { Activity, Shield } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useSentimentHistory, useAnalyzeSentiment } from '../hooks/useSentiment';

interface SentimentPanelProps {
  contactId: string;
  isAiUnavailable: boolean;
}

const sentimentVariant: Record<string, 'success' | 'default' | 'danger'> = {
  positive: 'success',
  neutral: 'default',
  'at-risk': 'danger',
};

export function SentimentPanel({ contactId, isAiUnavailable }: SentimentPanelProps) {
  const { t } = useTranslation('ai');
  const { data: history, isLoading } = useSentimentHistory(contactId);
  const analyzeMutation = useAnalyzeSentiment();

  if (isAiUnavailable) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Shield size={16} />
          {t('sentiment.title')}
        </h3>
        <Button
          variant="ghost"
          size="xs"
          loading={analyzeMutation.isPending}
          onClick={() => analyzeMutation.mutate(contactId)}
        >
          <Activity size={12} />
          {t('sentiment.analyze')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}

      {!isLoading && (!history || history.length === 0) && (
        <p className="text-sm text-gray-400">{t('sentiment.empty')}</p>
      )}

      {!isLoading && history && history.length > 0 && (
        <div className="space-y-2">
          {history.slice(0, 5).map((entry, i) => (
            <div key={i} className="flex items-start gap-2 rounded-md border p-2">
              <Badge variant={sentimentVariant[entry.sentiment] ?? 'default'} size="sm">
                {entry.sentiment}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 line-clamp-2">{entry.reasoning}</p>
                {entry.flags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {entry.flags.map((flag, j) => (
                      <span key={j} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
