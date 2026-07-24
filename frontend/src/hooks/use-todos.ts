"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { todoApi } from "@/services/todo"
import type { TodoListParams, CreateTodoRequest, UpdateTodoRequest, TodoListResponse } from "@/types"

export function useTodos(params: TodoListParams = {}) {
  return useQuery({
    queryKey: ["todos", params],
    queryFn: () => todoApi.list(params),
    staleTime: 30_000,
  })
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: ["todo", id],
    queryFn: () => todoApi.get(id),
    enabled: !!id,
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todoApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todoApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] })

      const previousData: Array<[readonly unknown[], TodoListResponse | undefined]> = []

      const queries = queryClient.getQueriesData<TodoListResponse>({
        queryKey: ["todos"],
      })

      for (const [queryKey, oldData] of queries) {
        previousData.push([queryKey, oldData])
        if (oldData?.data?.todos) {
          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              todos: oldData.data.todos.map((todo) =>
                todo.id === id ? { ...todo, ...data } : todo
              ),
            },
          })
        }
      }

      return { previousData }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, oldData] of context.previousData) {
          queryClient.setQueryData(queryKey, oldData)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => todoApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] })

      const previousData: Array<[readonly unknown[], TodoListResponse | undefined]> = []

      const queries = queryClient.getQueriesData<TodoListResponse>({
        queryKey: ["todos"],
      })

      for (const [queryKey, oldData] of queries) {
        previousData.push([queryKey, oldData])
        if (oldData?.data?.todos) {
          queryClient.setQueryData(queryKey, {
            ...oldData,
            data: {
              ...oldData.data,
              todos: oldData.data.todos.filter((todo) => todo.id !== id),
              pagination: {
                ...oldData.data.pagination,
                total: oldData.data.pagination.total - 1,
              },
            },
          })
        }
      }

      return { previousData }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, oldData] of context.previousData) {
          queryClient.setQueryData(queryKey, oldData)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}
