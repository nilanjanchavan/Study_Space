import { prisma } from '../config/prisma';

// ───────────────────────────────────────────────────────────────────────────
// Date helpers
// ───────────────────────────────────────────────────────────────────────────

/** Returns start of day (00:00:00.000) in local time → UTC. */
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Returns end of day (23:59:59.999). */
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Returns start of the week (Monday) containing `d`. */
function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // Monday-based
  x.setDate(x.getDate() + diff);
  return x;
}

/** Returns start of the month containing `d`. */
function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

/** Returns a date `days` before `d`. */
function daysAgo(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() - days);
  return x;
}

/** YYYY-MM-DD key for grouping. */
function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ───────────────────────────────────────────────────────────────────────────
// Dashboard — GET /api/analytics/dashboard
// ───────────────────────────────────────────────────────────────────────────

export async function getDashboard(userId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Run independent aggregates in parallel to avoid N+1.
  const [
    totalTodos,
    completedTodos,
    pendingTodos,
    overdueTodos,
    totalPomodoros,
    completedPomodoros,
    cancelledPomodoros,
    focusMinutesAgg,
    avgPomodoroAgg,
    totalFocusSessions,
    completedFocusSessions,
    activePomodoro,
    activeFocusSession,
  ] = await Promise.all([
    prisma.todo.count({ where: { userId } }),
    prisma.todo.count({ where: { userId, status: 'DONE' } }),
    prisma.todo.count({ where: { userId, status: { not: 'DONE' } } }),
    prisma.todo.count({
      where: { userId, status: { not: 'DONE' }, dueDate: { lt: now } },
    }),
    prisma.pomodoroSession.count({ where: { userId } }),
    prisma.pomodoroSession.count({ where: { userId, status: 'COMPLETED', type: 'WORK' } }),
    prisma.pomodoroSession.count({ where: { userId, status: 'CANCELLED' } }),
    prisma.pomodoroSession.aggregate({
      where: { userId, status: 'COMPLETED', type: 'WORK' },
      _sum: { actualMinutes: true },
    }),
    prisma.pomodoroSession.aggregate({
      where: { userId, status: 'COMPLETED', type: 'WORK' },
      _avg: { plannedMinutes: true },
    }),
    prisma.focusSession.count({ where: { userId } }),
    prisma.focusSession.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.pomodoroSession.findFirst({
      where: { userId, status: { in: ['RUNNING', 'PAUSED'] } },
    }),
    prisma.focusSession.findFirst({
      where: { userId, status: 'RUNNING' },
    }),
  ]);

  return {
    todos: {
      totalTodos,
      completedTodos,
      pendingTodos,
      overdueTodos,
    },
    pomodoros: {
      totalPomodoros,
      completedPomodoros,
      cancelledPomodoros,
      totalFocusMinutes: focusMinutesAgg._sum.actualMinutes ?? 0,
      averagePomodoroLength: Math.round(avgPomodoroAgg._avg.plannedMinutes ?? 0),
    },
    focusSessions: {
      totalFocusSessions,
      completedFocusSessions,
    },
    current: {
      activePomodoro: activePomodoro
        ? { id: activePomodoro.id, type: activePomodoro.type, status: activePomodoro.status }
        : null,
      activeFocusSession: activeFocusSession
        ? { id: activeFocusSession.id, mode: activeFocusSession.mode, goal: activeFocusSession.goal }
        : null,
    },
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Daily — GET /api/analytics/daily
// ───────────────────────────────────────────────────────────────────────────

export async function getDaily(userId: string, date?: Date) {
  const target = date ?? new Date();
  const dayStart = startOfDay(target);
  const dayEnd = endOfDay(target);

  const [focusAgg, completedPomodoros, completedTodos, focusSessions] = await Promise.all([
    prisma.pomodoroSession.aggregate({
      where: {
        userId,
        status: 'COMPLETED',
        type: 'WORK',
        startedAt: { gte: dayStart, lte: dayEnd },
      },
      _sum: { actualMinutes: true },
    }),
    prisma.pomodoroSession.count({
      where: {
        userId,
        status: 'COMPLETED',
        type: 'WORK',
        startedAt: { gte: dayStart, lte: dayEnd },
      },
    }),
    prisma.todo.count({
      where: { userId, status: 'DONE', completedAt: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.focusSession.count({
      where: { userId, status: 'COMPLETED', startedAt: { gte: dayStart, lte: dayEnd } },
    }),
  ]);

  const totalTodosToday = await prisma.todo.count({
    where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
  });

  const focusMinutes = focusAgg._sum.actualMinutes ?? 0;
  const completionRate = totalTodosToday > 0 ? Math.round((completedTodos / totalTodosToday) * 100) : 0;

  return {
    date: dateKey(target),
    focusMinutes,
    completedPomodoros,
    completedTodos,
    focusSessions,
    completionRate,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Weekly — GET /api/analytics/weekly
// ───────────────────────────────────────────────────────────────────────────

export async function getWeekly(userId: string) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(weekStart);

  // Single groupBy query for pomodoros per day.
  const [pomodoroGroups, todoGroups] = await Promise.all([
    prisma.pomodoroSession.groupBy({
      by: ['startedAt'],
      where: {
        userId,
        status: 'COMPLETED',
        type: 'WORK',
        startedAt: { gte: weekStart, lte: weekEnd },
      },
      _sum: { actualMinutes: true },
      _count: true,
    }),
    prisma.todo.groupBy({
      by: ['completedAt'],
      where: {
        userId,
        status: 'DONE',
        completedAt: { gte: weekStart, lte: weekEnd },
      },
      _count: true,
    }),
  ]);

  // Build a map of date → focusMinutes/pomodoros/completedTodos
  const dailyMap: Record<string, { focusMinutes: number; pomodoros: number; completedTodos: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    dailyMap[dateKey(d)] = { focusMinutes: 0, pomodoros: 0, completedTodos: 0 };
  }

  for (const g of pomodoroGroups) {
    const key = dateKey(g.startedAt);
    if (dailyMap[key]) {
      dailyMap[key].focusMinutes += g._sum.actualMinutes ?? 0;
      dailyMap[key].pomodoros += g._count;
    }
  }
  for (const g of todoGroups) {
    if (!g.completedAt) continue;
    const key = dateKey(g.completedAt);
    if (dailyMap[key]) {
      dailyMap[key].completedTodos += g._count;
    }
  }

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    days: Object.entries(dailyMap).map(([date, v]) => ({ date, ...v })),
  };
}

function endOfWeek(weekStart: Date): Date {
  const e = new Date(weekStart);
  e.setDate(e.getDate() + 6);
  return endOfDay(e);
}

// ───────────────────────────────────────────────────────────────────────────
// Monthly — GET /api/analytics/monthly
// ───────────────────────────────────────────────────────────────────────────

export async function getMonthly(userId: string, date?: Date) {
  const target = date ?? new Date();
  const monthStart = startOfMonth(target);
  const monthEnd = endOfMonth(target);

  const [focusAgg, completedPomodoros, completedTodos] = await Promise.all([
    prisma.pomodoroSession.aggregate({
      where: {
        userId,
        status: 'COMPLETED',
        type: 'WORK',
        startedAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { actualMinutes: true },
    }),
    prisma.pomodoroSession.count({
      where: {
        userId,
        status: 'COMPLETED',
        type: 'WORK',
        startedAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.todo.count({
      where: { userId, status: 'DONE', completedAt: { gte: monthStart, lte: monthEnd } },
    }),
  ]);

  // Weekly breakdown within the month.
  const weeks: { weekStart: string; focusMinutes: number; pomodoros: number }[] = [];
  let cursor = new Date(monthStart);
  while (cursor <= monthEnd) {
    const wStart = new Date(cursor);
    const wEnd = endOfDay(new Date(Math.min(cursor.getTime() + 6 * 86400000, monthEnd.getTime())));

    const [wFocus, wCount] = await Promise.all([
      prisma.pomodoroSession.aggregate({
        where: {
          userId,
          status: 'COMPLETED',
          type: 'WORK',
          startedAt: { gte: wStart, lte: wEnd },
        },
        _sum: { actualMinutes: true },
      }),
      prisma.pomodoroSession.count({
        where: {
          userId,
          status: 'COMPLETED',
          type: 'WORK',
          startedAt: { gte: wStart, lte: wEnd },
        },
      }),
    ]);

    weeks.push({
      weekStart: wStart.toISOString(),
      focusMinutes: wFocus._sum.actualMinutes ?? 0,
      pomodoros: wCount,
    });

    cursor = new Date(wEnd.getTime() + 1);
  }

  return {
    month: target.toISOString().slice(0, 7),
    totalFocusHours: Math.round(((focusAgg._sum.actualMinutes ?? 0) / 60) * 100) / 100,
    completedPomodoros,
    completedTodos,
    weeklyBreakdown: weeks,
  };
}

function endOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1, 0); // last day of current month
  return endOfDay(x);
}

// ───────────────────────────────────────────────────────────────────────────
// Streak — GET /api/analytics/streak
// ───────────────────────────────────────────────────────────────────────────

export async function getStreak(userId: string) {
  // Fetch distinct dates of COMPLETED WORK pomodoros, ordered desc.
  const sessions = await prisma.pomodoroSession.findMany({
    where: { userId, status: 'COMPLETED', type: 'WORK' },
    select: { startedAt: true },
    orderBy: { startedAt: 'desc' },
  });

  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Collect distinct date keys.
  const dateSet = new Set(sessions.map((s) => dateKey(s.startedAt)));
  const sortedDates = [...dateSet].sort().reverse(); // desc

  // Current streak: count back from today (or yesterday if nothing today yet).
  const today = dateKey(new Date());
  const yesterday = dateKey(daysAgo(new Date(), 1));
  let currentStreak = 0;

  let cursorDate: string | null = null;
  if (dateSet.has(today)) {
    cursorDate = today;
  } else if (dateSet.has(yesterday)) {
    cursorDate = yesterday;
  }

  if (cursorDate) {
    currentStreak = 1;
    let d = new Date(cursorDate);
    while (true) {
      d = daysAgo(d, 1);
      if (dateSet.has(dateKey(d))) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Longest streak: iterate all distinct dates in ascending order.
  const asc = [...dateSet].sort();
  let longestStreak = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of asc) {
    const d = new Date(key + 'T00:00:00.000Z');
    if (prev) {
      const diff = Math.round((d.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) {
        run++;
      } else if (diff === 0) {
        // same day — skip
      } else {
        run = 1;
      }
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    prev = d;
  }

  return { currentStreak, longestStreak };
}
