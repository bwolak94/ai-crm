import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '../api/activities.api';
import type { ActivityFiltersInput } from '@ai-crm/shared';

export function useActivities(filters?: Partial<ActivityFiltersInput>) {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activitiesApi.getAll(filters),
  });
}

export function useContactActivities(
  contactId: string | undefined,
  filters?: Partial<ActivityFiltersInput>,
) {
  return useQuery({
    queryKey: ['activities', 'contact', contactId, filters],
    queryFn: () => activitiesApi.getByContact(contactId!, filters),
    enabled: !!contactId,
  });
}
