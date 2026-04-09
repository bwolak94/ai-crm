import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, CheckSquare } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { ContactList } from '../components/ContactList';
import { ContactForm } from '../components/ContactForm';
import { BulkStatusBar } from '../components/BulkStatusBar';
import { useContacts } from '../hooks/useContacts';
import { useCreateContact } from '../hooks/useContactMutations';
import * as Dialog from '@radix-ui/react-dialog';

export function ContactsPage() {
  const { t } = useTranslation('contacts');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useContacts();
  const createMutation = useCreateContact();

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setBulkMode(false);
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('title')}
        actions={
          <div className="flex gap-2">
            <Button
              variant={bulkMode ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setBulkMode(!bulkMode);
                if (bulkMode) setSelectedIds(new Set());
              }}
            >
              <CheckSquare size={16} />
              {t('bulk.toggle')}
            </Button>
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <Button data-testid="create-contact-btn">
                  <Plus size={16} />
                  {tCommon('actions.create')}
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
                  <Dialog.Title className="mb-4 text-lg font-semibold">
                    {tCommon('actions.create')} {t('title')}
                  </Dialog.Title>
                  <ContactForm
                    onSubmit={(data) => {
                      createMutation.mutate(data, {
                        onSuccess: () => setOpen(false),
                      });
                    }}
                    loading={createMutation.isPending}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        }
      />

      {bulkMode && (
        <BulkStatusBar
          selectedIds={[...selectedIds]}
          onClear={clearSelection}
        />
      )}

      <ContactList
        contacts={data?.items ?? []}
        loading={isLoading}
        onContactClick={(id) => navigate(`/app/contacts/${id}`)}
        selectedIds={bulkMode ? selectedIds : undefined}
        onToggleSelect={bulkMode ? toggleSelect : undefined}
      />
    </div>
  );
}
