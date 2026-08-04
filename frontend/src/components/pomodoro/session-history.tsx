"use client"

import { usePomodoroHistory } from "@/hooks/use-pomodoro"
import { GlassCard } from "@/components/design-system/glass-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { CheckCircle2Icon, TimerIcon, CoffeeIcon, HistoryIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { PomodoroSessionItem } from "@/types"

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; label: string }> = {
  WORK: { icon: TimerIcon, color: "text-orange-500", label: "Work" },
  SHORT_BREAK: { icon: CoffeeIcon, color: "text-green-500", label: "Break" },
  LONG_BREAK: { icon: CoffeeIcon, color: "text-blue-500", label: "Long Break" },
}

function HistoryRow({ session }: { session: PomodoroSessionItem }) {
  const config = TYPE_CONFIG[session.type] ?? TYPE_CONFIG.WORK
  const Icon = config.icon

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon size={12} className={config.color} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground truncate">
          {session.plannedMinutes}min {config.label}
        </p>
      </div>
      <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap shrink-0">
        {formatDistanceToNow(new Date(session.endedAt ?? session.updatedAt), { addSuffix: true })}
      </span>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
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
      <div className="flex items-center gap-2 mb-3">
        <HistoryIcon size={14} className="text-muted-foreground shrink-0" />
        <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
          Recent Sessions
        </h3>
      </div>

      {isLoading ? (
        <div className="divide-y divide-border/50">
          {Array.from({ length: 3 }).map((_, i) => (
            <HistorySkeleton key={i} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2Icon size={24} className="text-muted-foreground/20 mb-2" />
          <p className="text-sm text-muted-foreground">No sessions yet</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Complete a pomodoro to see your history</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {sessions.map((session) => (
            <HistoryRow key={session.id} session={session} />
          ))}
        </div>
      )}
    </GlassCard>
  )
}
