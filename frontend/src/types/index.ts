export interface User {
  id: string
  email: string
  username: string
  name: string | null
  avatarUrl: string | null
  role: string
  isEmailVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  name?: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}
