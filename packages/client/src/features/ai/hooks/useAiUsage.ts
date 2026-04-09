import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';

export function useAiUsage() {
  return useQuery({
    queryKey: ['aiUsage'],
    queryFn: () => aiApi.getUsage(),
    staleTime: 5 * 60 * 1000,
  });
}
