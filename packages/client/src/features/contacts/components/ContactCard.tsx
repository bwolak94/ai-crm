import { useTranslation } from 'react-i18next';
import { Mail, Phone, Building2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import type { ContactStatus } from '@ai-crm/shared';

interface ContactCardProps {
  contact: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: ContactStatus;
  };
  onClick?: () => void;
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const { t } = useTranslation('contacts');

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
      role="button"
      tabIndex={0}
      data-testid="contact-list-item"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
        <Badge status={contact.status} size="sm" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} />
          {contact.email}
        </div>
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} />
            {contact.phone}
          </div>
        )}
        {contact.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 size={14} />
            {contact.company}
          </div>
        )}
      </div>
    </div>
  );
}
