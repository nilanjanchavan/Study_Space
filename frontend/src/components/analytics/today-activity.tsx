"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { SectionHeader } from "@/components/design-system/layout"
import { TimerIcon, CoffeeIcon, CheckCircleIcon, PercentIcon, SunIcon } from "lucide-react"
import type { DailyAnalytics } from "@/services/analytics"
import { cn } from "@/lib/utils"

interface TodayActivityProps {
  data: DailyAnalytics | undefined
  isLoading: boolean
}

function StatItem({ icon: Icon, label, value, unit, accent }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number | string
  unit?: string
  accent: string
}) {
  return (
      <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-border/50 bg-card/50 px-2 sm:px-3 py-2 sm:py-2.5 transition-all duration-200 hover:-translate-y-px hover:shadow-soft hover:bg-muted/30 dark:bg-white/[0.03]">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{label}</p>
          <p className="text-base sm:text-lg font-semibold text-foreground tabular-nums leading-tight">
            {value}
            {unit && <span className="text-[10px] sm:text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
          </p>
        </div>
        <div className={cn("flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg", accent)}>
          <Icon size={14} />
        </div>
      </div>
  )
}

export function TodayActivity({ data, isLoading }: TodayActivityProps) {
  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Today's Activity"
        accent={{
          icon: <SunIcon size={14} />,
          className: "bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400",
        }}
      />
      <div className="mt-3">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 px-3 py-2.5 dark:bg-white/[0.03]">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <StatItem icon={TimerIcon} label="Focus Time" value={data?.focusMinutes ?? 0} unit="min" accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <StatItem icon={CoffeeIcon} label="Pomodoros" value={data?.completedPomodoros ?? 0} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <StatItem icon={CheckCircleIcon} label="Todos Done" value={data?.completedTodos ?? 0} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <StatItem icon={PercentIcon} label="Completion" value={`${data?.completionRate ?? 0}%`} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          </div>
        )}
      </div>
    </GlassCard>
  )
}
