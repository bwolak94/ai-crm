import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';

export function useGenerateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      tone,
      dealId,
    }: {
      contactId: string;
      tone: 'professional' | 'friendly' | 'urgent';
      dealId?: string;
    }) => aiApi.generateFollowUp(contactId, tone, dealId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'contact', variables.contactId] });
    },
  });
}
