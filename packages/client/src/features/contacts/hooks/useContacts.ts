import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '../api/contacts.api';
import type { ContactFilters } from '@ai-crm/shared';

export function useContacts(filters?: ContactFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => contactsApi.getAll(filters),
  });
}
