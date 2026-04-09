import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trash2, Bot, Clock, AlertCircle, Mail } from 'lucide-react';
import { contactsApi } from '../api/contacts.api';
import { ContactForm } from '../components/ContactForm';
import { useUpdateContact, useDeleteContact } from '../hooks/useContactMutations';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ScoreHistoryChart } from '@/features/ai/components/ScoreHistoryChart';
import { ScoreSignals } from '@/features/ai/components/ScoreSignals';
import { RecommendedAction } from '@/features/ai/components/RecommendedAction';
import { FollowUpModal } from '@/features/ai/components/FollowUpModal';
import { SentimentPanel } from '@/features/ai/components/SentimentPanel';
import { useScoreHistory } from '@/features/ai/hooks/useScoreHistory';
import { useTriggerScoring } from '@/features/ai/hooks/useTriggerScoring';
import { ContactTimeline } from '@/features/activities/components/ContactTimeline';

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('contacts');
  const { t: tCommon } = useTranslation('common');
  const { t: tAi } = useTranslation('ai');
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [aiDisabledByError, setAiDisabledByError] = useState(false);

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.getById(id!),
    enabled: !!id,
  });

  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();
  const { data: scoreHistory, isLoading: isLoadingHistory, error: scoreHistoryError } = useScoreHistory(id);
  const triggerScoring = useTriggerScoring();

  const is503 = (err: unknown) =>
    (err as { response?: { status?: number } })?.response?.status === 503;

  const isAiUnavailable =
    aiDisabledByError ||
    is503(scoreHistoryError) ||
    is503(triggerScoring.error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!contact) {
    return <div className="py-12 text-center text-gray-500">{tCommon('status.empty')}</div>;
  }

  const latestScore = scoreHistory?.length ? scoreHistory[scoreHistory.length - 1] : null;

  return (
    <div>
      <PageHeader
        title={contact.name}
        actions={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/app/contacts')}>
              <ArrowLeft size={16} />
              {tCommon('actions.cancel')}
            </Button>
            {!isAiUnavailable && (
              <Button variant="secondary" onClick={() => setFollowUpOpen(true)}>
                <Mail size={16} />
                {tAi('followUp.title')}
              </Button>
            )}
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              data-testid="delete-contact-btn"
              onClick={() => {
                deleteMutation.mutate(id!, {
                  onSuccess: () => navigate('/app/contacts'),
                });
              }}
            >
              <Trash2 size={16} />
              {tCommon('actions.delete')}
            </Button>
          </div>
        }
      />
      <div className="mb-4">
        <Badge status={contact.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Edit form */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">{tCommon('actions.edit')}</h2>
          <ContactForm
            defaultValues={contact}
            loading={updateMutation.isPending}
            onSubmit={(data) => {
              updateMutation.mutate({ id: id!, data });
            }}
          />
        </div>

        {/* Activity Timeline */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <ContactTimeline contactId={id!} />
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{tAi('insights.title')}</h2>
              {!isAiUnavailable && (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={triggerScoring.isPending}
                  onClick={() => triggerScoring.mutate(id!)}
                >
                  <Bot size={14} />
                  {tAi('insights.rescore')}
                </Button>
              )}
            </div>

            {isAiUnavailable && (
              <div className="flex items-center gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
                <AlertCircle size={18} className="shrink-0 text-amber-500" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">{tAi('insights.unavailable')}</p>
                  <p className="mt-0.5 text-amber-600">{tAi('insights.unavailableHint')}</p>
                </div>
              </div>
            )}

            {!isAiUnavailable && latestScore && (
              <div className="mb-4 flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{
                    backgroundColor:
                      latestScore.value >= 70
                        ? '#22c55e'
                        : latestScore.value >= 40
                          ? '#f59e0b'
                          : '#ef4444',
                  }}
                >
                  {latestScore.value}
                </div>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {tAi('insights.lastScored')}:{' '}
                    {new Date(latestScore.scoredAt).toLocaleDateString()}
                  </div>
                  {latestScore.model && (
                    <div className="mt-0.5">
                      {tAi('insights.model')}: {latestScore.model}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isAiUnavailable && (
              isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : (
                <ScoreHistoryChart
                  history={scoreHistory ?? []}
                  contactName={contact.name}
                />
              )
            )}
          </div>

          {latestScore?.signals && (
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <ScoreSignals signals={latestScore.signals} />
            </div>
          )}

          {latestScore?.recommendedAction && (
            <RecommendedAction action={latestScore.recommendedAction} />
          )}

          {/* Sentiment Analysis */}
          <SentimentPanel contactId={id!} isAiUnavailable={isAiUnavailable} />
        </div>
      </div>

      {/* Follow-up Modal */}
      <FollowUpModal
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        contactId={id!}
        onAiUnavailable={() => {
          setAiDisabledByError(true);
          setFollowUpOpen(false);
        }}
      />
    </div>
  );
}
