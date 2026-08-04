"use client"

import { useMemo } from "react"
import { useDashboardAnalytics, useStreakAnalytics } from "@/hooks/use-analytics"
import { GlassCard } from "@/components/design-system/glass-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/design-system/skeleton"
import { FlameIcon, TimerIcon, FocusIcon, ZapIcon, TrophyIcon, ArrowRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Achievement {
  icon: React.ReactNode
  label: string
  color: string
  bgColor: string
  unlocked: boolean
}

export function AchievementsPreview() {
  const { data: dashboard, isLoading: dashLoading } = useDashboardAnalytics()
  const { data: streak, isLoading: streakLoading } = useStreakAnalytics()

  const isLoading = dashLoading || streakLoading
  const stats = dashboard?.data
  const streakData = streak?.data

  const achievements: Achievement[] = useMemo(() => {
    const result: Achievement[] = []
    const currentStreak = streakData?.currentStreak ?? 0
    const totalCompleted = stats?.pomodoros.completedPomodoros ?? 0
    const totalFocus = stats?.pomodoros.totalFocusMinutes ?? 0
    const completedSessions = stats?.focusSessions.completedFocusSessions ?? 0

    result.push({
      icon: <FlameIcon size={16} />,
      label: currentStreak >= 7 ? `${currentStreak}-Day Streak` : currentStreak >= 3 ? `${currentStreak}-Day Streak` : "Streak Builder",
      color: "text-amber-500",
      bgColor: currentStreak > 0 ? "bg-amber-500/10" : "bg-muted/40",
      unlocked: currentStreak > 0,
    })

    result.push({
      icon: <TimerIcon size={16} />,
      label: totalCompleted >= 50 ? "50 Pomodoros" : totalCompleted >= 10 ? "10 Pomodoros" : "Pomodoro Rookie",
      color: "text-orange-500",
      bgColor: totalCompleted >= 10 ? "bg-orange-500/10" : "bg-muted/40",
      unlocked: totalCompleted >= 10,
    })

    result.push({
      icon: <FocusIcon size={16} />,
      label: totalFocus >= 600 ? `${Math.round(totalFocus / 60)}hrs Focused` : completedSessions >= 5 ? "Deep Worker" : "Focus Starter",
      color: "text-blue-500",
      bgColor: totalFocus >= 120 ? "bg-blue-500/10" : "bg-muted/40",
      unlocked: totalFocus >= 120,
    })

    result.push({
      icon: <ZapIcon size={16} />,
      label: totalCompleted >= 100 ? "100 Pomodoros" : totalCompleted >= 25 ? "25 Pomodoros" : "Getting Started",
      color: "text-violet-500",
      bgColor: totalCompleted >= 25 ? "bg-violet-500/10" : "bg-muted/40",
      unlocked: totalCompleted >= 25,
    })

    return result
  }, [stats, streakData])

  if (isLoading) {
    return (
      <GlassCard className="p-4 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrophyIcon size={14} className="text-muted-foreground/40" />
          <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Achievements</h3>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View All <ArrowRightIcon size={10} />
        </Button>
      </div>

      <div className="space-y-2">
        {achievements.map((achievement, i) => (
          <div key={i} className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
            achievement.unlocked ? "opacity-100" : "opacity-40"
          )}>
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", achievement.bgColor)}>
              <span className={achievement.color}>{achievement.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                achievement.unlocked ? "text-foreground" : "text-muted-foreground"
              )}>
                {achievement.label}
              </p>
              {!achievement.unlocked && (
                <p className="text-[10px] text-muted-foreground/50">Locked</p>
              )}
            </div>
            {achievement.unlocked && (
              <span className="text-[10px] text-success font-medium">Unlocked</span>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
