import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { MessageSquare } from 'lucide-react';

export function AiChatPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader title={t('nav.aiChat')} />
      <EmptyState
        icon={<MessageSquare size={48} />}
        title="AI Chat coming soon"
        description="Natural language queries for your CRM data will be available here."
      />
    </div>
  );
}
