import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { ContactList } from '../components/ContactList';
import { ContactForm } from '../components/ContactForm';
import { useContacts } from '../hooks/useContacts';
import { useCreateContact } from '../hooks/useContactMutations';
import * as Dialog from '@radix-ui/react-dialog';

export function ContactsPage() {
  const { t } = useTranslation('contacts');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useContacts();
  const createMutation = useCreateContact();

  return (
    <div>
      <PageHeader
        title={t('title')}
        actions={
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
        }
      />
      <ContactList
        contacts={data?.items ?? []}
        loading={isLoading}
        onContactClick={(id) => navigate(`/app/contacts/${id}`)}
      />
    </div>
  );
}
