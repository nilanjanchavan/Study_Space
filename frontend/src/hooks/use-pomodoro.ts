"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { pomodoroApi } from "@/services/pomodoro"
import type { StartPomodoroRequest, PomodoroHistoryParams } from "@/types"

export function useCurrentPomodoro() {
  return useQuery({
    queryKey: ["pomodoro", "current"],
    queryFn: () => pomodoroApi.getCurrent(),
    refetchInterval: (query) => {
      const session = query.state.data?.data.session
      if (session && (session.status === "RUNNING" || session.status === "PAUSED")) {
        return 10_000
      }
      return false
    },
    staleTime: 5_000,
  })
}

export function useStartPomodoro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StartPomodoroRequest) => pomodoroApi.start(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro", "current"] })
    },
  })
}

export function usePausePomodoro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => pomodoroApi.pause(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro", "current"] })
    },
  })
}

export function useResumePomodoro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => pomodoroApi.resume(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro", "current"] })
    },
  })
}

export function useCompletePomodoro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => pomodoroApi.complete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro", "current"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useCancelPomodoro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => pomodoroApi.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pomodoro", "current"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function usePomodoroHistory(params: PomodoroHistoryParams = {}) {
  return useQuery({
    queryKey: ["pomodoro", "history", params],
    queryFn: () => pomodoroApi.history(params),
    staleTime: 30_000,
  })
}
