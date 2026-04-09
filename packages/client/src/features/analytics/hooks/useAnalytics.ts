import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';

export function useAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', days],
    queryFn: () => analyticsApi.get(days),
    staleTime: 2 * 60 * 1000,
  });
}
