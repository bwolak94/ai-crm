import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Copy, Check } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { useGenerateFollowUp } from '../hooks/useFollowUp';
import type { FollowUpResult } from '../api/ai.api';

interface FollowUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  onAiUnavailable?: () => void;
}

export function FollowUpModal({ open, onOpenChange, contactId, onAiUnavailable }: FollowUpModalProps) {
  const { t } = useTranslation('ai');
  const { t: tCommon } = useTranslation('common');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'urgent'>('professional');
  const [result, setResult] = useState<FollowUpResult | null>(null);
  const [copied, setCopied] = useState(false);
  const generateMutation = useGenerateFollowUp();

  const handleGenerate = () => {
    generateMutation.mutate(
      { contactId, tone },
      {
        onSuccess: (data) => setResult(data),
        onError: (err) => {
          if ((err as { response?: { status?: number } })?.response?.status === 503) {
            onAiUnavailable?.();
          }
        },
      },
    );
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setResult(null);
      setCopied(false);
    }
    onOpenChange(val);
  };

  const toneOptions = [
    { value: 'professional', label: t('followUp.tones.professional') },
    { value: 'friendly', label: t('followUp.tones.friendly') },
    { value: 'urgent', label: t('followUp.tones.urgent') },
  ];

  return (
    <Modal open={open} onOpenChange={handleClose} title={t('followUp.title')} size="lg">
      {!result ? (
        <div className="space-y-4">
          <Select
            label={t('followUp.tone')}
            options={toneOptions}
            value={tone}
            onChange={(e) => setTone(e.target.value as typeof tone)}
          />
          <Button onClick={handleGenerate} loading={generateMutation.isPending}>
            <Mail size={16} />
            {t('followUp.generate')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">{t('followUp.subject')}</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{result.subject}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">{t('followUp.body')}</p>
            <div className="mt-1 max-h-60 overflow-y-auto rounded-md border bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
              {result.body}
            </div>
          </div>
          {result.keyPoints.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">{t('followUp.keyPoints')}</p>
              <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                {result.keyPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t('followUp.copied') : t('followUp.copy')}
            </Button>
            <Button variant="ghost" onClick={() => setResult(null)}>
              {t('followUp.regenerate')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
