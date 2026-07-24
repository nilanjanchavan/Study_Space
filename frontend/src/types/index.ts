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

export type TodoPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type TodoStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED"

export interface Todo {
  id: string
  title: string
  description: string | null
  priority: TodoPriority
  status: TodoStatus
  dueDate: string | null
  sortOrder: number
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTodoRequest {
  title: string
  description?: string
  priority?: TodoPriority
  status?: TodoStatus
  dueDate?: string
  sortOrder?: number
}

export interface UpdateTodoRequest {
  title?: string
  description?: string | null
  priority?: TodoPriority
  status?: TodoStatus
  dueDate?: string | null
  sortOrder?: number
}

export interface TodoListParams {
  page?: number
  limit?: number
  status?: TodoStatus
  priority?: TodoPriority
  completed?: boolean
  sortBy?: "createdAt" | "dueDate" | "priority"
  sortOrder?: "asc" | "desc"
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TodoListResponse {
  success: boolean
  data: {
    todos: Todo[]
    pagination: Pagination
  }
}

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
    activePomodoro: {
      id: string
      type: string
      status: string
    } | null
    activeFocusSession: {
      id: string
      mode: string
      goal: string | null
    } | null
  }
}
