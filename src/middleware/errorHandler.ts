import { ErrorRequestHandler } from 'express';
import { env } from '../config/env';

/**
 * Centralized error handler.
 * Mounted as the last middleware so any thrown / next(err)'d error lands here.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500;
  const message = err.message ?? 'Internal Server Error';

  // eslint-disable-next-line no-console
  console.error(`[error] ${status} ${message}`, env.isDevelopment ? err.stack : '');

  res.status(status).json({
    success: false,
    error: {
      message,
      ...(env.isDevelopment && err.stack ? { stack: err.stack } : {}),
    },
  });
};
