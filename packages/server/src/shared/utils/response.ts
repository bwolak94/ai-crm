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
  data: PaginatedData<T>,
): void {
  res.json({ success: true as const, data });
}
