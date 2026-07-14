import { Prisma, FocusMode, SessionStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import type { StartFocusInput, HistoryFocusQuery } from '../validators/focus.validators';

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

/** Serialized focus session returned by the API. */
export type FocusSessionItem = {
  id: string;
  mode: string;
  strictModeEnabled: boolean;
  status: string;
  goal: string | null;
  plannedMinutes: number;
  actualMinutes: number | null;
  completedPomodoros: number;
  cancelledPomodoros: number;
  startedAt: string;
  endedAt: string | null;
  elapsedMs: number;
  pomodoroCount: number;
  createdAt: string;
  updatedAt: string;
};

export interface PaginatedFocusSessions {
  sessions: FocusSessionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Statuses considered "active" — a user may have at most one at a time. */
const ACTIVE_STATUSES: SessionStatus[] = ['RUNNING', 'PAUSED'];

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function serialize(
  s: {
    id: string;
    mode: FocusMode;
    strictModeEnabled: boolean;
    status: SessionStatus;
    goal: string | null;
    plannedMinutes: number;
    actualMinutes: number | null;
    completedPomodoros: number;
    cancelledPomodoros: number;
    startedAt: Date;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count?: { pomodoroSessions: number };
  },
  pomodoroCount?: number,
  now: Date = new Date(),
): FocusSessionItem {
  return {
    id: s.id,
    mode: s.mode,
    strictModeEnabled: s.strictModeEnabled,
    status: s.status,
    goal: s.goal,
    plannedMinutes: s.plannedMinutes,
    actualMinutes: s.actualMinutes,
    completedPomodoros: s.completedPomodoros,
    cancelledPomodoros: s.cancelledPomodoros,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt?.toISOString() ?? null,
    elapsedMs: s.endedAt
      ? s.endedAt.getTime() - s.startedAt.getTime()
      : now.getTime() - s.startedAt.getTime(),
    pomodoroCount: pomodoroCount ?? s._count?.pomodoroSessions ?? 0,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

/** Find the user's single active focus session (RUNNING), if any. */
async function findActive(userId: string) {
  return prisma.focusSession.findFirst({
    where: { userId, status: { in: ACTIVE_STATUSES } },
    orderBy: { startedAt: 'desc' },
    include: { _count: { select: { pomodoroSessions: true } } },
  });
}

/**
 * Recalculate aggregate stats for a focus session from its child pomodoro sessions.
 * Sums actualMinutes of COMPLETED WORK pomodoros and counts terminal pomodoros.
 */
async function computeStats(focusSessionId: string, now: Date) {
  const pomodoros = await prisma.pomodoroSession.findMany({
    where: { focusSessionId },
    select: { status: true, actualMinutes: true, type: true },
  });

  const completedPomodoros = pomodoros.filter((p) => p.status === 'COMPLETED' && p.type === 'WORK').length;
  const cancelledPomodoros = pomodoros.filter((p) => p.status === 'CANCELLED').length;

  // Total focus duration = sum of actualMinutes of completed WORK sessions.
  const focusMinutes = pomodoros
    .filter((p) => p.status === 'COMPLETED' && p.type === 'WORK')
    .reduce((sum, p) => sum + (p.actualMinutes ?? 0), 0);

  return { completedPomodoros, cancelledPomodoros, focusMinutes };
}

// ───────────────────────────────────────────────────────────────────────────
// State machine: START
// ───────────────────────────────────────────────────────────────────────────

export async function startFocus(userId: string, input: StartFocusInput): Promise<FocusSessionItem> {
  const { mode, goal, plannedMinutes } = input;

  // Enforce single-active-session invariant.
  const active = await findActive(userId);
  if (active) {
    throw AppError.conflict(
      'A Focus Session is already active; end or cancel it first',
      'FOCUS_SESSION_ALREADY_ACTIVE',
    );
  }

  const session = await prisma.focusSession.create({
    data: {
      userId,
      mode,
      strictModeEnabled: mode === 'STRICT',
      goal: goal ?? null,
      plannedMinutes,
      status: 'RUNNING',
    },
  });

  return serialize(session, 0);
}

// ───────────────────────────────────────────────────────────────────────────
// State machine: END  (RUNNING → COMPLETED)
// ───────────────────────────────────────────────────────────────────────────

export async function endFocus(userId: string): Promise<FocusSessionItem> {
  const active = await findActive(userId);
  if (!active) {
    throw AppError.notFound('No active Focus Session', 'NO_ACTIVE_FOCUS_SESSION');
  }

  const now = new Date();
  const stats = await computeStats(active.id, now);

  const updated = await prisma.focusSession.update({
    where: { id: active.id },
    data: {
      status: 'COMPLETED',
      endedAt: now,
      completedPomodoros: stats.completedPomodoros,
      cancelledPomodoros: stats.cancelledPomodoros,
      actualMinutes: stats.focusMinutes,
    },
    include: { _count: { select: { pomodoroSessions: true } } },
  });

  return serialize(updated, undefined, now);
}

// ───────────────────────────────────────────────────────────────────────────
// State machine: CANCEL  (RUNNING → CANCELLED)
// ───────────────────────────────────────────────────────────────────────────

export async function cancelFocus(userId: string): Promise<FocusSessionItem> {
  const active = await findActive(userId);
  if (!active) {
    throw AppError.notFound('No active Focus Session', 'NO_ACTIVE_FOCUS_SESSION');
  }

  const now = new Date();
  const stats = await computeStats(active.id, now);

  const updated = await prisma.focusSession.update({
    where: { id: active.id },
    data: {
      status: 'CANCELLED',
      endedAt: now,
      completedPomodoros: stats.completedPomodoros,
      cancelledPomodoros: stats.cancelledPomodoros,
      actualMinutes: stats.focusMinutes,
    },
    include: { _count: { select: { pomodoroSessions: true } } },
  });

  return serialize(updated, undefined, now);
}

// ───────────────────────────────────────────────────────────────────────────
// Current  (GET /api/focus/current)
// ───────────────────────────────────────────────────────────────────────────

export async function getCurrentFocus(userId: string): Promise<FocusSessionItem | null> {
  const active = await findActive(userId);
  return active ? serialize(active) : null;
}

// ───────────────────────────────────────────────────────────────────────────
// Get by ID  (GET /api/focus/:id)
// ───────────────────────────────────────────────────────────────────────────

export async function getFocusById(userId: string, focusId: string): Promise<FocusSessionItem> {
  const session = await prisma.focusSession.findUnique({
    where: { id: focusId },
    include: { _count: { select: { pomodoroSessions: true } } },
  });

  if (!session || session.userId !== userId) {
    throw AppError.notFound('Focus Session not found', 'FOCUS_SESSION_NOT_FOUND');
  }

  return serialize(session);
}

// ───────────────────────────────────────────────────────────────────────────
// History  (GET /api/focus/history)
// ───────────────────────────────────────────────────────────────────────────

export async function getFocusHistory(
  userId: string,
  query: HistoryFocusQuery,
): Promise<PaginatedFocusSessions> {
  const { page, limit, mode, status, from, to } = query;

  const where: Prisma.FocusSessionWhereInput = { userId };
  if (mode) where.mode = mode;
  if (status) where.status = status;
  if (from || to) {
    where.startedAt = {};
    if (from) where.startedAt.gte = from;
    if (to) where.startedAt.lte = to;
  }

  const [total, sessions] = await Promise.all([
    prisma.focusSession.count({ where }),
    prisma.focusSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { pomodoroSessions: true } } },
    }),
  ]);

  return {
    sessions: sessions.map((s) => serialize(s)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
