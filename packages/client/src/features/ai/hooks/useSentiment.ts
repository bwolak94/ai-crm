import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';

export function useSentimentHistory(contactId: string | undefined) {
  return useQuery({
    queryKey: ['sentimentHistory', contactId],
    queryFn: () => aiApi.getSentimentHistory(contactId!),
    enabled: !!contactId,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 503) return false;
      return failureCount < 3;
    },
  });
}

export function useAnalyzeSentiment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => aiApi.analyzeSentiment(contactId),
    onSuccess: (_data, contactId) => {
      queryClient.invalidateQueries({ queryKey: ['sentimentHistory', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts', contactId] });
    },
  });
}
