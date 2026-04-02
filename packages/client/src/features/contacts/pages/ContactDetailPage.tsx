import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { contactsApi } from '../api/contacts.api';
import { ContactForm } from '../components/ContactForm';
import { useUpdateContact, useDeleteContact } from '../hooks/useContactMutations';
import { PageHeader } from '@/shared/components/layout/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Spinner } from '@/shared/components/ui/Spinner';

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('contacts');
  const { t: tCommon } = useTranslation('common');

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.getById(id!),
    enabled: !!id,
  });

  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();

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

  return (
    <div>
      <PageHeader
        title={contact.name}
        actions={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/contacts')}>
              <ArrowLeft size={16} />
              {tCommon('actions.cancel')}
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate(id!, {
                  onSuccess: () => navigate('/contacts'),
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
      <div className="max-w-md rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{tCommon('actions.edit')}</h2>
        <ContactForm
          defaultValues={contact}
          loading={updateMutation.isPending}
          onSubmit={(data) => {
            updateMutation.mutate({ id: id!, data });
          }}
        />
      </div>
    </div>
  );
}
