import { Response } from 'express';

/**
 * Enforces a single, consistent JSON response envelope across the API.
 *
 * Success: { success: true,  data:    ... }
 * Error:   { success: false, error:   { message, code?, details? } }
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(res: Response, data: T, status = 200): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return res.status(status).json(body);
}

export function sendError(
  res: Response,
  message: string,
  status = 500,
  code?: string,
  details?: unknown,
): Response {
  const body: ApiError = { success: false, error: { message, code, details } };
  return res.status(status).json(body);
}
