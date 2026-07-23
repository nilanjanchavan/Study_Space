import api from "@/lib/api"
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types"

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log("[auth] POST /api/auth/register", { email: data.email, username: data.username })
    const response = await api.post<AuthResponse>("/api/auth/register", data)
    console.log("[auth] /api/auth/register → 201", response.data.data.user.username)
    return response.data
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log("[auth] POST /api/auth/login", { email: data.email })
    const response = await api.post<AuthResponse>("/api/auth/login", data)
    console.log("[auth] /api/auth/login → 201", response.data.data.user.username)
    return response.data
  },

  async logout(): Promise<void> {
    console.log("[auth] POST /api/auth/logout")
    await api.post("/api/auth/logout")
    console.log("[auth] /api/auth/logout → 200")
  },

  async getMe(): Promise<{ success: boolean; data: { user: AuthResponse["data"]["user"] } }> {
    const response = await api.get("/api/auth/me")
    return response.data
  },

  async refresh(): Promise<AuthResponse> {
    console.log("[auth] POST /api/auth/refresh")
    const response = await api.post<AuthResponse>("/api/auth/refresh")
    console.log("[auth] /api/auth/refresh → 200")
    return response.data
  },
}
