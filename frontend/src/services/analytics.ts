import api from "@/lib/api"

// ── Response Types ─────────────────────────────────────────────────────────

export interface DashboardAnalytics {
  todos: {
    totalTodos: number
    completedTodos: number
    pendingTodos: number
    overdueTodos: number
  }
  pomodoros: {
    totalPomodoros: number
    completedPomodoros: number
    cancelledPomodoros: number
    totalFocusMinutes: number
    averagePomodoroLength: number
  }
  focusSessions: {
    totalFocusSessions: number
    completedFocusSessions: number
  }
  current: {
    activePomodoro: { id: string; type: string; status: string } | null
    activeFocusSession: { id: string; mode: string; goal: string | null } | null
  }
}

export interface DailyAnalytics {
  date: string
  focusMinutes: number
  completedPomodoros: number
  completedTodos: number
  focusSessions: number
  completionRate: number
}

export interface WeeklyDay {
  date: string
  focusMinutes: number
  pomodoros: number
  completedTodos: number
}

export interface WeeklyAnalytics {
  weekStart: string
  weekEnd: string
  days: WeeklyDay[]
}

export interface WeeklyBreakdown {
  weekStart: string
  focusMinutes: number
  pomodoros: number
}

export interface MonthlyAnalytics {
  month: string
  totalFocusHours: number
  completedPomodoros: number
  completedTodos: number
  weeklyBreakdown: WeeklyBreakdown[]
}

export interface StreakAnalytics {
  currentStreak: number
  longestStreak: number
}

// ── API Methods ────────────────────────────────────────────────────────────

export const analyticsApi = {
  async dashboard(): Promise<{ success: boolean; data: DashboardAnalytics }> {
    const response = await api.get("/api/analytics/dashboard")
    return response.data
  },

  async daily(date?: string): Promise<{ success: boolean; data: DailyAnalytics }> {
    const params = date ? { date } : {}
    const response = await api.get("/api/analytics/daily", { params })
    return response.data
  },

  async weekly(): Promise<{ success: boolean; data: WeeklyAnalytics }> {
    const response = await api.get("/api/analytics/weekly")
    return response.data
  },

  async monthly(date?: string): Promise<{ success: boolean; data: MonthlyAnalytics }> {
    const params = date ? { date } : {}
    const response = await api.get("/api/analytics/monthly", { params })
    return response.data
  },

  async streak(): Promise<{ success: boolean; data: StreakAnalytics }> {
    const response = await api.get("/api/analytics/streak")
    return response.data
  },
}
