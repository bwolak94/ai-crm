import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';

export function useScoreHistory(contactId: string | undefined) {
  return useQuery({
    queryKey: ['scoreHistory', contactId],
    queryFn: () => aiApi.getScoreHistory(contactId!),
    enabled: !!contactId,
  });
}
