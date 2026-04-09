import { useQuery } from '@tanstack/react-query';
import { pipelineApi } from '../api/pipeline.api';
import type { DealFiltersInput } from '@ai-crm/shared';

export function usePipeline(filters?: Partial<DealFiltersInput>) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: () => pipelineApi.getAll({ ...filters, limit: 100 }),
  });
}
