import { Prisma, PomodoroType, SessionStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import type { StartPomodoroInput, HistoryQuery } from '../validators/pomodoro.validators';

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

/** Serialized pomodoro session returned by the API. */
export type PomodoroSessionItem = {
  id: string;
  type: string;
  status: string;
  plannedMinutes: number;
  actualMinutes: number | null;
  startedAt: string;
  endedAt: string | null;
  pausedAt: string | null;
  accumulatedPausedMs: number;
  todoId: string | null;
  elapsedMs: number; // wall-clock ms since start
  focusMs: number; // elapsed minus paused
  createdAt: string;
  updatedAt: string;
};

export interface PaginatedSessions {
  sessions: PomodoroSessionItem[];
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
    type: PomodoroType;
    status: SessionStatus;
    plannedMinutes: number;
    actualMinutes: number | null;
    startedAt: Date;
    endedAt: Date | null;
    pausedAt: Date | null;
    accumulatedPausedMs: number;
    todoId: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  now: Date = new Date(),
): PomodoroSessionItem {
  const elapsedMs = now.getTime() - s.startedAt.getTime();
  // If currently paused, the ongoing pause duration isn't yet in accumulatedPausedMs.
  const currentPauseMs = s.pausedAt ? now.getTime() - s.pausedAt.getTime() : 0;
  const focusMs = Math.max(0, elapsedMs - s.accumulatedPausedMs - currentPauseMs);

  return {
    id: s.id,
    type: s.type,
    status: s.status,
    plannedMinutes: s.plannedMinutes,
    actualMinutes: s.actualMinutes,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt?.toISOString() ?? null,
    pausedAt: s.pausedAt?.toISOString() ?? null,
    accumulatedPausedMs: s.accumulatedPausedMs,
    todoId: s.todoId,
    elapsedMs,
    focusMs,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

/** Resolve the default planned duration from the user's preferences by type. */
function defaultDuration(user: {
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
}): Record<PomodoroType, number> {
  return {
    WORK: user.pomodoroLength,
    SHORT_BREAK: user.shortBreakLength,
    LONG_BREAK: user.longBreakLength,
  };
}

/** Find the user's single active session (RUNNING or PAUSED), if any. */
async function findActive(userId: string) {
  return prisma.pomodoroSession.findFirst({
    where: { userId, status: { in: ACTIVE_STATUSES } },
    orderBy: { startedAt: 'desc' },
  });
}

// ───────────────────────────────────────────────────────────────────────────
// State machine: START
// ───────────────────────────────────────────────────────────────────────────

export async function startSession(
  userId: string,
  input: StartPomodoroInput,
): Promise<PomodoroSessionItem> {
  const type: PomodoroType = (input as { type?: PomodoroType }).type ?? 'WORK';
  const durationMinutes = (input as { durationMinutes?: number }).durationMinutes;
  const todoId = (input as { todoId?: string }).todoId;

  // Enforce single-active-session invariant.
  const active = await findActive(userId);
  if (active) {
    throw AppError.conflict(
      'A Pomodoro session is already active; complete or cancel it first',
      'SESSION_ALREADY_ACTIVE',
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pomodoroLength: true, shortBreakLength: true, longBreakLength: true },
  });
  if (!user) throw AppError.notFound('User not found', 'USER_NOT_FOUND');

  const plannedMinutes = durationMinutes ?? defaultDuration(user)[type];

  // Validate todo ownership if a todoId is provided.
  if (todoId) {
    const todo = await prisma.todo.findUnique({ where: { id: todoId }, select: { userId: true } });
    if (!todo || todo.userId !== userId) {
      throw AppError.notFound('Todo not found', 'TODO_NOT_FOUND');
    }
  }

  const session = await prisma.pomodoroSession.create({
    data: {
      userId,
      todoId: todoId ?? null,
      type,
      plannedMinutes,
      status: 'RUNNING',
    },
  });

  return serialize(session);
}

// ───────────────────────────────────────────────────────────────────────────
// State machine: PAUSE  (RUNNING → PAUSED)
// ───────────────────────────────────────────────────────────────────────────

export async function pauseSession(userId: string): Promise<PomodoroSessionItem> {
  const active = await findActive(userId);
  if (!active) {
    throw AppError.notFound('No active Pomodoro session', 'NO_ACTIVE_SESSION');
  }
  if (active.status === 'PAUSED') {
    throw AppError.conflict('Session is already paused', 'SESSION_ALREADY_PAUSED');
  }

  const updated = await prisma.pomodoroSession.update({
    where: { id: active.id },
    data: { status: 'PAUSED', pausedAt: new Date() },
  });

  return serialize(updated);
}

// ───────────────────────────────────────────────────────────────────────────
// State machine: RESUME  (PAUSED → RUNNING)
// ───────────────────────────────────────────────────────────────────────────

export async function resumeSession(userId: string): Promise<PomodoroSessionItem> {
  const active = await findActive(userId);
  if (!active) {
    throw AppError.notFound('No active Pomodoro session', 'NO_ACTIVE_SESSION');
  }
  if (active.status === 'RUNNING') {
    throw AppError.conflict('Session is already running', 'SESSION_ALREADY_RUNNING');
  }

  const now = new Date();
  // Fold the just-ended pause into the accumulator.
  const accumulatedPausedMs =
    active.accumulatedPausedMs + (active.pausedAt ? now.getTime() - active.pausedAt.getTime() : 0);

  const updated = await prisma.pomodoroSession.update({
    where: { id: active.id },
    data: { status: 'RUNNING', pausedAt: null, accumulatedPausedMs },
  });

  return serialize(updated);
}

// ───────────────────────────────────────────────────────────────────────────
// State machine: COMPLETE  (RUNNING|PAUSED → COMPLETED)
// ───────────────────────────────────────────────────────────────────────────

export async function completeSession(userId: string): Promise<PomodoroSessionItem> {
  const active = await findActive(userId);
  if (!active) {
    throw AppError.notFound('No active Pomodoro session', 'NO_ACTIVE_SESSION');
  }

  const now = new Date();
  let accumulatedPausedMs = active.accumulatedPausedMs;
  if (active.pausedAt) {
    // If completing while paused, fold that pause in too.
    accumulatedPausedMs += now.getTime() - active.pausedAt.getTime();
  }

  const focusMs = now.getTime() - active.startedAt.getTime() - accumulatedPausedMs;
  const actualMinutes = Math.max(0, Math.round(focusMs / 60000));

  const updated = await prisma.pomodoroSession.update({
    where: { id: active.id },
    data: {
      status: 'COMPLETED',
      endedAt: now,
      pausedAt: null,
      accumulatedPausedMs,
      actualMinutes,
    },
  });

  return serialize(updated, now);
}

// ───────────────────────────────────────────────────────────────────────────
// State machine: CANCEL  (RUNNING|PAUSED → CANCELLED)
// ───────────────────────────────────────────────────────────────────────────

export async function cancelSession(userId: string): Promise<PomodoroSessionItem> {
  const active = await findActive(userId);
  if (!active) {
    throw AppError.notFound('No active Pomodoro session', 'NO_ACTIVE_SESSION');
  }

  const now = new Date();
  let accumulatedPausedMs = active.accumulatedPausedMs;
  if (active.pausedAt) {
    accumulatedPausedMs += now.getTime() - active.pausedAt.getTime();
  }

  const focusMs = now.getTime() - active.startedAt.getTime() - accumulatedPausedMs;
  const actualMinutes = Math.max(0, Math.round(focusMs / 60000));

  const updated = await prisma.pomodoroSession.update({
    where: { id: active.id },
    data: {
      status: 'CANCELLED',
      endedAt: now,
      pausedAt: null,
      accumulatedPausedMs,
      actualMinutes,
    },
  });

  return serialize(updated, now);
}

// ───────────────────────────────────────────────────────────────────────────
// Current session  (GET /api/pomodoro/current)
// ───────────────────────────────────────────────────────────────────────────

export async function getCurrentSession(userId: string): Promise<PomodoroSessionItem | null> {
  const active = await findActive(userId);
  return active ? serialize(active) : null;
}

// ───────────────────────────────────────────────────────────────────────────
// History  (GET /api/pomodoro/history)
// ───────────────────────────────────────────────────────────────────────────

export async function getHistory(
  userId: string,
  query: HistoryQuery,
): Promise<PaginatedSessions> {
  const { page, limit, type, status, from, to } = query;

  const where: Prisma.PomodoroSessionWhereInput = { userId };
  if (type) where.type = type;
  if (status) where.status = status;
  if (from || to) {
    where.startedAt = {};
    if (from) where.startedAt.gte = from;
    if (to) where.startedAt.lte = to;
  }

  const [total, sessions] = await Promise.all([
    prisma.pomodoroSession.count({ where }),
    prisma.pomodoroSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
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
