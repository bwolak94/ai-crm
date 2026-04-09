import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { useBulkUpdateStatus } from '../hooks/useContactMutations';
import { useState } from 'react';

interface BulkStatusBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkStatusBar({ selectedIds, onClear }: BulkStatusBarProps) {
  const { t } = useTranslation('contacts');
  const { t: tCommon } = useTranslation('common');
  const [status, setStatus] = useState('lead');
  const bulkMutation = useBulkUpdateStatus();

  if (selectedIds.length === 0) return null;

  const statusOptions = [
    { value: 'lead', label: t('status.lead') },
    { value: 'prospect', label: t('status.prospect') },
    { value: 'customer', label: t('status.customer') },
    { value: 'churned', label: t('status.churned') },
  ];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
      <span className="text-sm font-medium text-blue-700">
        {t('bulk.selected', { count: selectedIds.length })}
      </span>
      <Select
        options={statusOptions}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-40"
      />
      <Button
        size="sm"
        loading={bulkMutation.isPending}
        onClick={() => {
          bulkMutation.mutate({ ids: selectedIds, status }, {
            onSuccess: () => onClear(),
          });
        }}
      >
        {t('bulk.update')}
      </Button>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto rounded-md p-1 text-blue-400 hover:text-blue-600"
      >
        <X size={16} />
      </button>
    </div>
  );
}
