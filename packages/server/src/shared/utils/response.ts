import { Response } from 'express';
import { ApiResponse, PaginatedData } from '@ai-crm/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
): void {
  const response: ApiResponse<T> = { success: true, data };
  if (message) {
    response.message = message;
  }
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number,
): void {
  const totalPages = Math.ceil(total / limit);
  const data: PaginatedData<T> = {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
  res.json({ success: true as const, data });
}
