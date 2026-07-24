"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/common/skeleton"
import { FlameIcon } from "lucide-react"
import type { StreakAnalytics } from "@/services/analytics"

interface StreakCardProps {
  data: StreakAnalytics | undefined
  isLoading: boolean
}

export function StreakCard({ data, isLoading }: StreakCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Streaks</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-6">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
              <FlameIcon size={28} className="text-orange-500 dark:text-orange-400" />
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">
                  {data?.currentStreak ?? 0}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {(data?.currentStreak ?? 0) === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold text-foreground">
                  {data?.longestStreak ?? 0}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {(data?.longestStreak ?? 0) === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
