import { PaginatedData } from '@ai-crm/shared';

export function buildPaginatedData<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedData<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
