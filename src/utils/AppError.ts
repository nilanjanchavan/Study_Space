/**
 * Operational application error.
 *
 * Carries an HTTP `status` and an `isOperational` flag so the central error
 * handler can distinguish expected business errors (validation, auth, not
 * found) from unexpected programmer errors.
 */
export class AppError extends Error {
  public readonly status: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.isOperational = status < 500;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = 'Bad request', code?: string, details?: unknown): AppError {
    return new AppError(message, 400, code, details);
  }

  static unauthorized(message = 'Unauthorized', code?: string, details?: unknown): AppError {
    return new AppError(message, 401, code, details);
  }

  static forbidden(message = 'Forbidden', code?: string, details?: unknown): AppError {
    return new AppError(message, 403, code, details);
  }

  static notFound(message = 'Not found', code?: string, details?: unknown): AppError {
    return new AppError(message, 404, code, details);
  }

  static conflict(message = 'Conflict', code?: string, details?: unknown): AppError {
    return new AppError(message, 409, code, details);
  }
}
