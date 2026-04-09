import { useTranslation } from 'react-i18next';
import { Lightbulb, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface RecommendedActionProps {
  action: string;
  onLogActivity?: () => void;
}

export function RecommendedAction({ action, onLogActivity }: RecommendedActionProps) {
  const { t } = useTranslation('ai');

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Lightbulb size={16} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900">
            {t('recommendedAction.title')}
          </h4>
          <p className="mt-1 text-sm text-blue-800">{action}</p>
          {onLogActivity && (
            <div className="mt-3">
              <Button variant="secondary" size="sm" onClick={onLogActivity}>
                <Plus size={14} />
                {t('recommendedAction.logActivity')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
