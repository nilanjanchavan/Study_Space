import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';

/**
 * Centralized error handler.
 * Mounted as the last middleware so any thrown / next(err)'d error lands here.
 * Always responds with the consistent { success, error } envelope.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // ── Map known error types to AppError ──────────────────────────

  // Prisma unique-constraint violation (e.g. duplicate email on race condition).
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
    err = AppError.conflict(`Duplicate value for: ${target}`, 'DUPLICATE_FIELD');
  }

  // Normalize: anything without an HTTP `status` is a 500.
  const status = (err as { status?: number }).status ?? 500;
  const isOperational = err instanceof AppError ? err.isOperational : status < 500;
  const code = (err as { code?: string }).code;
  const details = (err as { details?: unknown }).details;
  const message = err?.message ?? 'Internal Server Error';

  // ── Logging ────────────────────────────────────────────────────
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[error] 500 ${message}`, env.isDevelopment ? err.stack : '');
  } else if (env.isDevelopment) {
    // eslint-disable-next-line no-console
    console.warn(`[error] ${status} ${message}`);
  }

  sendError(
    res,
    isOperational ? message : 'Internal Server Error',
    status,
    code,
    env.isDevelopment ? details : status < 500 ? details : undefined,
  );
};
