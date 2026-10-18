import api, { getRefreshToken, setRefreshToken, setAccessToken, clearAuthTokens } from "@/lib/api"
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types"

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log("[auth] POST /api/auth/register", { email: data.email, username: data.username })
    const response = await api.post<AuthResponse>("/api/auth/register", data)
    const authData = response.data.data
    console.log("[auth] /api/auth/register → 201", authData.user.username)
    if (authData.accessToken) setAccessToken(authData.accessToken)
    if (authData.refreshToken) setRefreshToken(authData.refreshToken)
    return response.data
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log("[auth] POST /api/auth/login", { email: data.email })
    const response = await api.post<AuthResponse>("/api/auth/login", data)
    const authData = response.data.data
    console.log("[auth] /api/auth/login → 201", authData.user.username)
    if (authData.accessToken) setAccessToken(authData.accessToken)
    if (authData.refreshToken) setRefreshToken(authData.refreshToken)
    return response.data
  },

  async logout(): Promise<void> {
    console.log("[auth] POST /api/auth/logout")
    const refreshToken = getRefreshToken()
    try {
      await api.post("/api/auth/logout", { refreshToken })
      console.log("[auth] /api/auth/logout → 200")
    } finally {
      clearAuthTokens()
    }
  },

  async getMe(): Promise<{ success: boolean; data: { user: AuthResponse["data"]["user"] } }> {
    const response = await api.get("/api/auth/me")
    return response.data
  },

  async refresh(): Promise<AuthResponse> {
    console.log("[auth] POST /api/auth/refresh")
    const refreshToken = getRefreshToken()
    const response = await api.post<AuthResponse>("/api/auth/refresh", { refreshToken })
    console.log("[auth] /api/auth/refresh → 200")
    const authData = response.data.data
    if (authData.accessToken) setAccessToken(authData.accessToken)
    if (authData.refreshToken) setRefreshToken(authData.refreshToken)
    return response.data
  },
}
