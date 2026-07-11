import { z } from 'zod';

// ───────────────────────────────────────────────────────────────────────────
// Enums must match the Prisma schema values exactly.
// ───────────────────────────────────────────────────────────────────────────

const PomodoroType = z.enum(['WORK', 'SHORT_BREAK', 'LONG_BREAK']);

// ───────────────────────────────────────────────────────────────────────────
// Start — POST /api/pomodoro/start
// ───────────────────────────────────────────────────────────────────────────

export const startPomodoroBodySchema = z.object({
  type: PomodoroType.default('WORK'),
  /** Override the planned duration (minutes). Falls back to the user's preference. */
  durationMinutes: z.coerce.number().int().min(1).max(180).optional(),
  /** Optional todo this session targets. Must belong to the user (checked in service). */
  todoId: z.string().uuid('Invalid todo ID format').optional(),
});

/** Accepts an empty body or omitted entirely. */
export const startPomodoroSchema = startPomodoroBodySchema.nullish().transform((v) => v ?? {});

export type StartPomodoroInput = z.infer<typeof startPomodoroBodySchema>;

// ───────────────────────────────────────────────────────────────────────────
// History query — GET /api/pomodoro/history
// ───────────────────────────────────────────────────────────────────────────

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: PomodoroType.optional(),
  status: z.enum(['RUNNING', 'COMPLETED', 'ABANDONED', 'PAUSED', 'CANCELLED']).optional(),
  /** Inclusive lower bound (ISO date). */
  from: z.coerce.date().optional(),
  /** Inclusive upper bound (ISO date). */
  to: z.coerce.date().optional(),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;
