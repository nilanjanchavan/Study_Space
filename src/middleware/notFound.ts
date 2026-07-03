import { RequestHandler } from 'express';

/**
 * 404 handler — fires for any route that wasn't matched.
 */
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
};
