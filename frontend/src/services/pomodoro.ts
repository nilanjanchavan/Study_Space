import api from "@/lib/api"
import type {
  PomodoroSessionItem,
  StartPomodoroRequest,
  PomodoroHistoryParams,
} from "@/types"

function buildHistoryQuery(params: PomodoroHistoryParams): string {
  const sp = new URLSearchParams()
  if (params.page) sp.set("page", String(params.page))
  if (params.limit) sp.set("limit", String(params.limit))
  if (params.type) sp.set("type", params.type)
  if (params.status) sp.set("status", params.status)
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}

export const pomodoroApi = {
  async getCurrent(): Promise<{ success: boolean; data: { session: PomodoroSessionItem | null } }> {
    const response = await api.get("/api/pomodoro/current")
    return response.data
  },

  async start(data: StartPomodoroRequest = {}): Promise<{ success: boolean; data: { session: PomodoroSessionItem } }> {
    const response = await api.post("/api/pomodoro/start", data)
    return response.data
  },

  async pause(): Promise<{ success: boolean; data: { session: PomodoroSessionItem } }> {
    const response = await api.post("/api/pomodoro/pause")
    return response.data
  },

  async resume(): Promise<{ success: boolean; data: { session: PomodoroSessionItem } }> {
    const response = await api.post("/api/pomodoro/resume")
    return response.data
  },

  async complete(): Promise<{ success: boolean; data: { session: PomodoroSessionItem } }> {
    const response = await api.post("/api/pomodoro/complete")
    return response.data
  },

  async cancel(): Promise<{ success: boolean; data: { session: PomodoroSessionItem } }> {
    const response = await api.post("/api/pomodoro/cancel")
    return response.data
  },

  async history(params: PomodoroHistoryParams = {}): Promise<{ success: boolean; data: { sessions: PomodoroSessionItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }> {
    const qs = buildHistoryQuery(params)
    const response = await api.get(`/api/pomodoro/history${qs}`)
    return response.data
  },
}
