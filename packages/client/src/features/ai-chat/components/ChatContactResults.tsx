import { useNavigate } from 'react-router-dom';
import { ContactCard } from '@/features/contacts/components/ContactCard';
import type { ContactStatus } from '@ai-crm/shared';

interface ContactResult {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: ContactStatus;
}

interface ChatContactResultsProps {
  contacts: ContactResult[];
}

export function ChatContactResults({ contacts }: ChatContactResultsProps) {
  const navigate = useNavigate();

  if (contacts.length === 0) return null;

  return (
    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {contacts.map((contact) => (
        <ContactCard
          key={contact._id}
          contact={contact}
          onClick={() => navigate(`/app/contacts/${contact._id}`)}
        />
      ))}
    </div>
  );
}
