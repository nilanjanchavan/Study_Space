"use client"

import { usePomodoroHistory } from "@/hooks/use-pomodoro"
import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
import { Skeleton } from "@/components/design-system/skeleton"
import { CheckCircle2Icon, TimerIcon, CoffeeIcon, HistoryIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { PomodoroSessionItem } from "@/types"

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; label: string }> = {
  WORK: { icon: TimerIcon, label: "Work" },
  SHORT_BREAK: { icon: CoffeeIcon, label: "Break" },
  LONG_BREAK: { icon: CoffeeIcon, label: "Long Break" },
}

function HistoryRow({ session }: { session: PomodoroSessionItem }) {
  const config = TYPE_CONFIG[session.type] ?? TYPE_CONFIG.WORK
  const Icon = config.icon

  return (
    <div className="flex items-center gap-3 rounded-lg bg-card/50 border border-border/50 px-3 py-2.5 transition-all duration-200 hover:bg-muted/30 hover:shadow-soft">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground truncate tabular-nums">
          {session.plannedMinutes}min {config.label}
        </p>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
        <Icon size={13} className="text-rose-500" />
      </div>
      <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap shrink-0">
        {formatDistanceToNow(new Date(session.endedAt ?? session.updatedAt), { addSuffix: true })}
      </span>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-card/50 border border-border/50 px-3 py-2.5">
      <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-3 w-16 shrink-0" />
    </div>
  )
}

export function SessionHistory() {
  const { data, isLoading } = usePomodoroHistory({ status: "COMPLETED", limit: 6 })
  const sessions = data?.data.sessions ?? []

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Recent Sessions"
        accent={{ icon: <HistoryIcon size={14} />, className: "bg-rose-500/10 text-rose-500" }}
      />

      {isLoading ? (
        <div className="space-y-2 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <HistorySkeleton key={i} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2Icon size={24} className="text-rose-500/20 mb-2" />
          <p className="text-sm text-muted-foreground">No sessions yet</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Complete a pomodoro to see your history</p>
        </div>
      ) : (
        <div className="space-y-2 mt-4">
          {sessions.map((session) => (
            <HistoryRow key={session.id} session={session} />
          ))}
        </div>
      )}
    </GlassCard>
  )
}
