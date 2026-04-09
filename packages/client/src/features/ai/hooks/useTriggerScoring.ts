import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';

export function useTriggerScoring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => aiApi.triggerScoring(contactId),
    onSuccess: (_data, contactId) => {
      queryClient.invalidateQueries({ queryKey: ['scoreHistory', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
    },
  });
}

export function useBulkScoring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactIds: string[]) => aiApi.triggerBulkScoring(contactIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['scoreHistory'] });
    },
  });
}
