import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { DealCreateSchema, type DealCreate } from '@ai-crm/shared';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { contactsApi } from '@/features/contacts/api/contacts.api';

interface DealFormProps {
  onSubmit: (data: DealCreate) => void;
  defaultValues?: Partial<DealCreate>;
  loading?: boolean;
}

interface ContactOption {
  _id: string;
  name: string;
  company?: string;
}

export function DealForm({ onSubmit, defaultValues, loading }: DealFormProps) {
  const { t } = useTranslation('pipeline');
  const { t: tCommon } = useTranslation('common');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DealCreate>({
    resolver: zodResolver(DealCreateSchema),
    defaultValues: {
      stage: 'discovery',
      priority: 'medium',
      currency: 'USD',
      ...defaultValues,
    },
  });

  const [contactSearch, setContactSearch] = useState('');
  const [contactResults, setContactResults] = useState<ContactOption[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(
    null,
  );
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchContacts(contactSearch), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [contactSearch, searchContacts]);

  const stageOptions = [
    { value: 'discovery', label: t('stages.discovery') },
    { value: 'proposal', label: t('stages.proposal') },
    { value: 'negotiation', label: t('stages.negotiation') },
    { value: 'closed_won', label: t('stages.closed_won') },
    { value: 'closed_lost', label: t('stages.closed_lost') },
  ];

  const priorityOptions = [
    { value: 'low', label: t('priority.low') },
    { value: 'medium', label: t('priority.medium') },
    { value: 'high', label: t('priority.high') },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'PLN', label: 'PLN' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label={t('deal.title')}
        error={errors.title?.message}
        required
        {...register('title')}
      />

      {/* Contact searchable select */}
      <div className="relative w-full">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t('deal.contact')} <span className="ml-1 text-red-500">*</span>
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
          placeholder={t('deal.searchContact')}
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
              <p className="p-3 text-sm text-gray-500">
                {t('deal.noContacts')}
              </p>
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
                <span className="font-medium text-gray-900">
                  {contact.name}
                </span>
                {contact.company && (
                  <span className="text-gray-400">· {contact.company}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('deal.value')}
          type="number"
          error={errors.value?.message}
          required
          {...register('value', { valueAsNumber: true })}
        />
        <Select
          label={t('deal.currency')}
          options={currencyOptions}
          {...register('currency')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label={t('deal.stage')}
          options={stageOptions}
          error={errors.stage?.message}
          {...register('stage')}
        />
        <Select
          label={t('deal.priority')}
          options={priorityOptions}
          error={errors.priority?.message}
          {...register('priority')}
        />
      </div>

      <Input
        label={t('deal.expectedCloseDate')}
        type="date"
        error={errors.expectedCloseDate?.message}
        {...register('expectedCloseDate')}
      />

      <Textarea
        label={t('deal.description')}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {tCommon('actions.save')}
        </Button>
      </div>
    </form>
  );
}
