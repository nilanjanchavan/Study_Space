import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';
import pomodoroRoutes from './routes/pomodoro.routes';
import focusRoutes from './routes/focus.routes';
import analyticsRoutes from './routes/analytics.routes';
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
  // Cookies must be allowed for our auth flow when front-end runs elsewhere.
  app.use(
    cors({
      origin: true, // dev: reflect origin; tighten in prod
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
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
  app.use('/api/auth', authRoutes);
  app.use('/api/todos', todoRoutes);
  app.use('/api/pomodoro', pomodoroRoutes);
  app.use('/api/focus', focusRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // ── Fallbacks ────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
