import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Check } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useContacts } from '@/features/contacts/hooks/useContacts';
import { useBulkScoring } from '../hooks/useTriggerScoring';

interface BulkScoringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkScoringModal({ open, onOpenChange }: BulkScoringModalProps) {
  const { t } = useTranslation('ai');
  const { t: tCommon } = useTranslation('common');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useContacts({ limit: 50 });
  const bulkScoring = useBulkScoring();

  const contacts = data?.items ?? [];

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const toggleContact = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c._id)));
    }
  };

  const handleSubmit = () => {
    if (selected.size === 0) return;
    bulkScoring.mutate([...selected], {
      onSuccess: () => {
        setSelected(new Set());
        onOpenChange(false);
      },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('bulkScoring.title')}
      description={t('bulkScoring.description')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon('actions.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={bulkScoring.isPending}
            disabled={selected.size === 0}
          >
            <Bot size={16} />
            {t('bulkScoring.start', { count: selected.size })}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          placeholder={t('bulkScoring.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center justify-between text-xs text-gray-500">
          <button type="button" onClick={toggleAll} className="hover:text-gray-700">
            {selected.size === filtered.length
              ? t('bulkScoring.deselectAll')
              : t('bulkScoring.selectAll')}
          </button>
          <span>
            {t('bulkScoring.selected', { count: selected.size })}
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto rounded-md border">
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Spinner size="md" />
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">
              {tCommon('status.empty')}
            </p>
          )}
          {filtered.map((contact) => {
            const isSelected = selected.has(contact._id);
            return (
              <button
                key={contact._id}
                type="button"
                onClick={() => toggleContact(contact._id)}
                className="flex w-full items-center gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check size={12} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {contact.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {contact.email}
                    {contact.company && ` · ${contact.company}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
