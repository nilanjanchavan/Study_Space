"use client"

import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/services/todo"

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => analyticsApi.dashboard(),
    staleTime: 60_000,
  })
}
