"use client"

import { CodeforcesStats } from "@/services/codeforces"
import { useCodeforcesSettings } from "@/hooks/use-settings"
import { GlassCard } from "@/components/design-system/glass-card"
import { Button } from "@/components/ui/button"
import { TargetIcon, FlameIcon, AwardIcon, PlusIcon, MinusIcon, CheckCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CfDailyGoalProps {
  stats: CodeforcesStats | null
}

export function CfDailyGoal({ stats }: CfDailyGoalProps) {
  const [settings, updateSettings] = useCodeforcesSettings()

  const dailyGoal = settings.dailyGoal ?? 3
  const solvedToday = stats?.solvedToday ?? 0
  const progressPct = Math.min(100, Math.round((solvedToday / dailyGoal) * 100))
  const isGoalReached = solvedToday >= dailyGoal

  const currentStreak = stats?.streak?.current ?? 0
  const longestStreak = stats?.streak?.longest ?? 0

  const handleAdjustGoal = (delta: number) => {
    const next = Math.max(1, Math.min(30, dailyGoal + delta))
    updateSettings({ dailyGoal: next })
  }

  return (
    <GlassCard className="p-5 border-border/60 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TargetIcon size={16} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Questions Solved Today</h3>
              <p className="text-xs text-muted-foreground">Daily problem target & momentum</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/40">
            <Button
              variant="ghost"
              size="sm"
              className="size-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => handleAdjustGoal(-1)}
              disabled={dailyGoal <= 1}
              title="Decrease goal"
            >
              <MinusIcon size={13} />
            </Button>
            <span className="text-xs font-semibold px-2 tabular-nums" title="Questions per day target">
              {dailyGoal}/day
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="size-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => handleAdjustGoal(1)}
              disabled={dailyGoal >= 30}
              title="Increase goal"
            >
              <PlusIcon size={13} />
            </Button>
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground tabular-nums">
              {solvedToday}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              / {dailyGoal} solved
            </span>
          </div>
          <span className="text-xs font-semibold text-primary tabular-nums">
            {progressPct}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-muted/80 rounded-full overflow-hidden p-0.5 border border-border/40">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isGoalReached ? "bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-primary shadow-[0_0_8px_var(--primary)]"
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Goal message */}
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {isGoalReached ? (
            <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
              <CheckCircleIcon size={13} /> Daily goal accomplished! Outstanding work!
            </span>
          ) : (
            <span className="text-muted-foreground">
              {dailyGoal - solvedToday} more {dailyGoal - solvedToday === 1 ? "problem" : "problems"} needed to meet today's goal
            </span>
          )}
        </div>
      </div>

      {/* Streak cards */}
      <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-border/40">
        <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-card/40 px-3 py-2">
          <span className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            currentStreak > 0 ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
          )}>
            <FlameIcon size={14} className={currentStreak > 0 ? "animate-pulse" : ""} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate font-medium">Current Streak</p>
            <p className="text-sm font-bold text-foreground tabular-nums truncate">
              {currentStreak} {currentStreak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-card/40 px-3 py-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <AwardIcon size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate font-medium">Best Streak</p>
            <p className="text-sm font-bold text-foreground tabular-nums truncate">
              {longestStreak} {longestStreak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
