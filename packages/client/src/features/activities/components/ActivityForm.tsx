import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ActivityCreateSchema, type ActivityCreate } from '@ai-crm/shared';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { contactsApi } from '@/features/contacts/api/contacts.api';

interface ActivityFormProps {
  onSubmit: (data: ActivityCreate) => void;
  defaultContactId?: string;
  loading?: boolean;
}

interface ContactOption {
  _id: string;
  name: string;
  company?: string;
}

export function ActivityForm({ onSubmit, defaultContactId, loading }: ActivityFormProps) {
  const { t } = useTranslation('activities');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActivityCreate>({
    resolver: zodResolver(ActivityCreateSchema),
    defaultValues: {
      type: 'note',
      contactId: defaultContactId ?? '',
    },
  });

  const [contactSearch, setContactSearch] = useState('');
  const [contactResults, setContactResults] = useState<ContactOption[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const searchContacts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setContactResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await contactsApi.getAll({ search: query, limit: 10 } as never);
      setContactResults(
        (data.items as ContactOption[]).map((c) => ({
          _id: c._id,
          name: c.name,
          company: c.company,
        })),
      );
    } catch {
      setContactResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (defaultContactId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchContacts(contactSearch), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [contactSearch, searchContacts, defaultContactId]);

  const typeOptions = [
    { value: 'call', label: t('types.call') },
    { value: 'email', label: t('types.email') },
    { value: 'note', label: t('types.note') },
    { value: 'meeting', label: t('types.meeting') },
    { value: 'task', label: t('types.task') },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="activity-form">
      {!defaultContactId && (
        <div className="relative w-full">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('fields.contact')} <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            value={selectedContact ? selectedContact.name : contactSearch}
            onChange={(e) => {
              setContactSearch(e.target.value);
              setSelectedContact(null);
              setShowDropdown(true);
            }}
            onFocus={() => contactSearch.length >= 2 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={t('fields.searchContact')}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.contactId && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.contactId.message}
            </p>
          )}
          {showDropdown && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
              {isSearching && (
                <div className="flex items-center justify-center p-3">
                  <Spinner size="sm" />
                </div>
              )}
              {!isSearching && contactResults.length === 0 && contactSearch.length >= 2 && (
                <p className="p-3 text-sm text-gray-500">{t('fields.noContacts')}</p>
              )}
              {contactResults.map((contact) => (
                <button
                  key={contact._id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSelectedContact(contact);
                    setContactSearch(contact.name);
                    setValue('contactId', contact._id, { shouldValidate: true });
                    setShowDropdown(false);
                  }}
                >
                  <span className="font-medium text-gray-900">{contact.name}</span>
                  {contact.company && <span className="text-gray-400">· {contact.company}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Select
        label={t('fields.type')}
        options={typeOptions}
        error={errors.type?.message}
        {...register('type')}
      />

      <Input
        label={t('fields.title')}
        error={errors.title?.message}
        required
        {...register('title')}
      />

      <Textarea
        label={t('fields.body')}
        error={errors.body?.message}
        {...register('body')}
      />

      <Input
        label={t('fields.scheduledAt')}
        type="datetime-local"
        {...register('scheduledAt')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} data-testid="activity-form-submit">
          {tCommon('actions.save')}
        </Button>
      </div>
    </form>
  );
}
