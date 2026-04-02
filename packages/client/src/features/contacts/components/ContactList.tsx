import { useTranslation } from 'react-i18next';
import { ContactCard } from './ContactCard';
import { Spinner } from '@/shared/components/ui/Spinner';
import type { ContactStatus } from '@ai-crm/shared';

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: ContactStatus;
}

interface ContactListProps {
  contacts: Contact[];
  loading?: boolean;
  onContactClick?: (id: string) => void;
}

export function ContactList({ contacts, loading, onContactClick }: ContactListProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        {t('status.empty')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <ContactCard
          key={contact._id}
          contact={contact}
          onClick={() => onContactClick?.(contact._id)}
        />
      ))}
    </div>
  );
}
