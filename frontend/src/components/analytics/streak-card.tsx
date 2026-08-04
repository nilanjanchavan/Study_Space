"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { SectionHeader } from "@/components/design-system/layout"
import { FlameIcon } from "lucide-react"
import type { StreakAnalytics } from "@/services/analytics"
import { cn } from "@/lib/utils"

interface StreakCardProps {
  data: StreakAnalytics | undefined
  isLoading: boolean
}

export function StreakCard({ data, isLoading }: StreakCardProps) {
  return (
    <GlassCard className="p-4">
      <SectionHeader title="Streaks" />
      <div className="mt-3">
        {isLoading ? (
          <div className="flex items-center gap-6">
            <Skeleton className="size-16 rounded-2xl" />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className={cn(
              "flex size-12 sm:size-16 shrink-0 items-center justify-center rounded-2xl",
              (data?.currentStreak ?? 0) > 0
                ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-500 dark:from-orange-400/20 dark:to-amber-400/20 dark:text-orange-400"
                : "bg-muted text-muted-foreground"
            )}>
              <FlameIcon size={22} />
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div>
                <p className="text-[11px] text-muted-foreground">Current</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                  {data?.currentStreak ?? 0}
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
                    {(data?.currentStreak ?? 0) === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Best</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                  {data?.longestStreak ?? 0}
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
                    {(data?.longestStreak ?? 0) === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
