import api from "@/lib/api"
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoListParams,
  TodoListResponse,
} from "@/types"

function buildQueryString(params: TodoListParams): string {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  if (params.status) searchParams.set("status", params.status)
  if (params.priority) searchParams.set("priority", params.priority)
  if (params.completed !== undefined) searchParams.set("completed", String(params.completed))
  if (params.sortBy) searchParams.set("sortBy", params.sortBy)
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder)
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ""
}

export const todoApi = {
  async list(params: TodoListParams = {}): Promise<TodoListResponse> {
    const qs = buildQueryString(params)
    const response = await api.get<TodoListResponse>(`/api/todos${qs}`)
    return response.data
  },

  async get(id: string): Promise<{ success: boolean; data: { todo: Todo } }> {
    const response = await api.get(`/api/todos/${id}`)
    return response.data
  },

  async create(data: CreateTodoRequest): Promise<{ success: boolean; data: { todo: Todo } }> {
    const response = await api.post("/api/todos", data)
    return response.data
  },

  async update(
    id: string,
    data: UpdateTodoRequest
  ): Promise<{ success: boolean; data: { todo: Todo } }> {
    const response = await api.patch(`/api/todos/${id}`, data)
    return response.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/todos/${id}`)
  },
}
