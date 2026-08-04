"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { ProgressBar } from "@/components/design-system/progress"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { TimerIcon, FlameIcon, TargetIcon, ZapIcon } from "lucide-react"

interface SessionInfoProps {
  todayCount: number
  dailyGoal: number
  currentCycle: number
  longBreakInterval: number
  streak: number
  completedSessions: number
}

export function SessionInfo({
  todayCount,
  dailyGoal,
  currentCycle,
  longBreakInterval,
  streak,
  completedSessions,
}: SessionInfoProps) {
  const percent = dailyGoal > 0 ? Math.min(100, Math.round((todayCount / dailyGoal) * 100)) : 0
  const remaining = Math.max(0, longBreakInterval - currentCycle)

  return (
    <GlassCard className="p-4">
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
          Today&apos;s Progress
        </h3>

        <div className="flex items-center justify-center py-2">
          <ProgressRing value={todayCount} max={dailyGoal} size={100} strokeWidth={8} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatItem icon={<TimerIcon size={12} className="text-primary" />} label="Sessions" value={String(todayCount)} />
          <StatItem icon={<TargetIcon size={12} className="text-green-500" />} label="Goal" value={`${percent}%`} />
          <StatItem icon={<FlameIcon size={12} className="text-orange-500" />} label="Streak" value={String(streak)} />
          <StatItem icon={<ZapIcon size={12} className="text-blue-500" />} label="Next Break" value={String(remaining)} />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Cycle</span>
            <span className="font-medium text-foreground tabular-nums">{currentCycle} / {longBreakInterval}</span>
          </div>
          <ProgressBar value={currentCycle} max={longBreakInterval} />
        </div>

        {completedSessions > 0 && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Focus Time</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {completedSessions * 25} min
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  )

  function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
      <div className="min-w-0 rounded-xl bg-muted/40 p-2 sm:p-3 text-center">
        <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
          {icon}
          <span className="text-[10px] text-muted-foreground font-medium truncate">{label}</span>
        </div>
        <p className="text-base sm:text-lg font-bold text-foreground tabular-nums truncate">{value}</p>
      </div>
    )
  }
}
