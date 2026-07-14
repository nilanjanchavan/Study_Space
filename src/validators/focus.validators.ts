import { z } from 'zod';

// ───────────────────────────────────────────────────────────────────────────
// Enums must match the Prisma schema values exactly.
// ───────────────────────────────────────────────────────────────────────────

const FocusModeEnum = z.enum(['NORMAL', 'STRICT']);

// ───────────────────────────────────────────────────────────────────────────
// Start — POST /api/focus/start
// ───────────────────────────────────────────────────────────────────────────

export const startFocusBodySchema = z.object({
  mode: FocusModeEnum.default('NORMAL'),
  goal: z.string().trim().min(1, 'Goal cannot be empty').max(500, 'Goal too long (max 500)').optional(),
  /** Planned total duration in minutes. */
  plannedMinutes: z.coerce.number().int().min(1, 'plannedMinutes must be at least 1').max(720, 'plannedMinutes too large (max 720)'),
});

/** Accepts a body; required since plannedMinutes has no default. */
export const startFocusSchema = startFocusBodySchema;

export type StartFocusInput = z.infer<typeof startFocusBodySchema>;

// ───────────────────────────────────────────────────────────────────────────
// History query — GET /api/focus/history
// ───────────────────────────────────────────────────────────────────────────

export const historyFocusQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  mode: FocusModeEnum.optional(),
  status: z.enum(['RUNNING', 'COMPLETED', 'ABANDONED', 'PAUSED', 'CANCELLED']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type HistoryFocusQuery = z.infer<typeof historyFocusQuerySchema>;

// ───────────────────────────────────────────────────────────────────────────
// Params — :id (UUID)
// ───────────────────────────────────────────────────────────────────────────

export const focusIdParamSchema = z.object({
  id: z.string().uuid('Invalid focus session ID format'),
});
