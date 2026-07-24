"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { focusApi } from "@/services/focus"
import type { StartFocusRequest, FocusHistoryParams } from "@/types"

export function useCurrentFocus() {
  return useQuery({
    queryKey: ["focus", "current"],
    queryFn: () => focusApi.getCurrent(),
    refetchInterval: (query) => {
      const session = query.state.data?.data.session
      if (session && session.status === "RUNNING") {
        return 10_000
      }
      return false
    },
    staleTime: 5_000,
  })
}

export function useStartFocus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StartFocusRequest) => focusApi.start(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus", "current"] })
    },
  })
}

export function useEndFocus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => focusApi.end(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus", "current"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useCancelFocus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => focusApi.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus", "current"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
    },
  })
}

export function useFocusHistory(params: FocusHistoryParams = {}) {
  return useQuery({
    queryKey: ["focus", "history", params],
    queryFn: () => focusApi.history(params),
    staleTime: 30_000,
  })
}
