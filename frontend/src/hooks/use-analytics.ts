"use client"

import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/services/analytics"
import type { DashboardAnalytics, DailyAnalytics, WeeklyAnalytics, MonthlyAnalytics, StreakAnalytics } from "@/services/analytics"

export function useDashboardAnalytics() {
  return useQuery<{ success: boolean; data: DashboardAnalytics }>({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => analyticsApi.dashboard(),
    staleTime: 60_000,
  })
}

export function useDailyAnalytics(date?: string) {
  return useQuery<{ success: boolean; data: DailyAnalytics }>({
    queryKey: ["analytics", "daily", date ?? "today"],
    queryFn: () => analyticsApi.daily(date),
    staleTime: 60_000,
  })
}

export function useWeeklyAnalytics() {
  return useQuery<{ success: boolean; data: WeeklyAnalytics }>({
    queryKey: ["analytics", "weekly"],
    queryFn: () => analyticsApi.weekly(),
    staleTime: 60_000,
  })
}

export function useMonthlyAnalytics(date?: string) {
  return useQuery<{ success: boolean; data: MonthlyAnalytics }>({
    queryKey: ["analytics", "monthly", date ?? "current"],
    queryFn: () => analyticsApi.monthly(date),
    staleTime: 60_000,
  })
}

export function useStreakAnalytics() {
  return useQuery<{ success: boolean; data: StreakAnalytics }>({
    queryKey: ["analytics", "streak"],
    queryFn: () => analyticsApi.streak(),
    staleTime: 60_000,
  })
}
