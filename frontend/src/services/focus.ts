import api from "@/lib/api"
import type {
  FocusSessionItem,
  StartFocusRequest,
  FocusHistoryParams,
} from "@/types"

function buildHistoryQuery(params: FocusHistoryParams): string {
  const sp = new URLSearchParams()
  if (params.page) sp.set("page", String(params.page))
  if (params.limit) sp.set("limit", String(params.limit))
  if (params.mode) sp.set("mode", params.mode)
  if (params.status) sp.set("status", params.status)
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}

export const focusApi = {
  async getCurrent(): Promise<{ success: boolean; data: { session: FocusSessionItem | null } }> {
    const response = await api.get("/api/focus/current")
    return response.data
  },

  async start(data: StartFocusRequest): Promise<{ success: boolean; data: { session: FocusSessionItem } }> {
    const response = await api.post("/api/focus/start", data)
    return response.data
  },

  async end(): Promise<{ success: boolean; data: { session: FocusSessionItem } }> {
    const response = await api.post("/api/focus/end")
    return response.data
  },

  async cancel(): Promise<{ success: boolean; data: { session: FocusSessionItem } }> {
    const response = await api.post("/api/focus/cancel")
    return response.data
  },

  async get(id: string): Promise<{ success: boolean; data: { session: FocusSessionItem } }> {
    const response = await api.get(`/api/focus/${id}`)
    return response.data
  },

  async history(params: FocusHistoryParams = {}): Promise<{ success: boolean; data: { sessions: FocusSessionItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }> {
    const qs = buildHistoryQuery(params)
    const response = await api.get(`/api/focus/history${qs}`)
    return response.data
  },
}
