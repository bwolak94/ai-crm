import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { Spinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { PipelineBoard } from '../components/PipelineBoard';
import { PipelineSummary } from '../components/PipelineSummary';
import { DealForm } from '../components/DealForm';
import { usePipeline } from '../hooks/usePipeline';
import { useCreateDeal } from '../hooks/useDealMutations';

export function PipelinePage() {
  const { t } = useTranslation('pipeline');
  const { t: tCommon } = useTranslation('common');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = usePipeline();
  const createMutation = useCreateDeal();

  const deals = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t('title')}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} />
            {tCommon('actions.create')}
          </Button>
        }
      />

      <PipelineSummary deals={deals} />

      {deals.length === 0 ? (
        <EmptyState
          title={tCommon('status.empty')}
          description="Create your first deal to get started."
          action={{
            label: tCommon('actions.create'),
            onClick: () => setCreateOpen(true),
          }}
        />
      ) : (
        <PipelineBoard deals={deals} />
      )}

      <Modal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t('form.createTitle')}
        size="lg"
      >
        <DealForm
          onSubmit={(data) => {
            createMutation.mutate(data, {
              onSuccess: () => setCreateOpen(false),
            });
          }}
          loading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}
