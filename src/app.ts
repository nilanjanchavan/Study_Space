import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRoutes from './routes/health.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';

/**
 * Creates and configures the Express application.
 * Kept separate from `server.ts` so the app can be imported in tests without
 * binding to a port.
 */
export function createApp(): Express {
  const app = express();

  // ── Global middleware ────────────────────────────────
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  // ── API root ping (lightweight, no DB) ───────────────
  app.get('/api', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        name: 'Study Workspace API',
        version: '0.1.0',
      },
    });
  });

  // ── Feature routes ───────────────────────────────────
  app.use('/api', healthRoutes);

  // ── Fallbacks ────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
