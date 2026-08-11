"use client"

import { useStreakAnalytics } from "@/hooks/use-analytics"
import { FloatingCard } from "@/components/design-system/floating-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { FlameIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const STREAK_MESSAGES = [
  "Start your streak today!",
  "One day strong!",
  "Building momentum!",
  "You're on fire!",
  "Unstoppable!",
  "Legendary focus!",
  "Incredible dedication!",
  "Absolute master!",
]

export function CurrentStreak() {
  const { data: streak, isLoading } = useStreakAnalytics()
  const streakData = streak?.data
  const current = streakData?.currentStreak ?? 0
  const longest = streakData?.longestStreak ?? 0
  const message = STREAK_MESSAGES[Math.min(current, STREAK_MESSAGES.length - 1)]

  return (
    <FloatingCard className="p-5">
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {current} <span className="text-sm font-normal text-muted-foreground">day{current !== 1 ? "s" : ""}</span>
              </p>
              <p className="text-caption text-muted-foreground mt-0.5">{message}</p>
            </div>
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                current > 0
                  ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-500 dark:from-orange-400/20 dark:to-amber-400/20 dark:text-orange-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <FlameIcon size={24} />
            </div>
          </div>
          {longest > 0 && longest !== current && (
            <p className="text-[11px] text-muted-foreground/60">
              Best streak: {longest} days
            </p>
          )}
        </div>
      )}
    </FloatingCard>
  )
}
