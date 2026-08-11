"use client"

import { useMemo } from "react"
import { usePomodoroHistory } from "@/hooks/use-pomodoro"
import { useFocusHistory } from "@/hooks/use-focus"
import { useTodos } from "@/hooks/use-todos"
import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
import { EmptyState } from "@/components/design-system/empty-state"
import { Skeleton } from "@/components/design-system/skeleton"
import { TimerIcon, FocusIcon, CheckCircle2Icon, HistoryIcon, CoffeeIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: "pomodoro" | "focus" | "todo" | "break"
  title: string
  time: string
  detail?: string
}

const ICON_MAP = {
  pomodoro: <TimerIcon size={13} className="text-orange-500" />,
  focus: <FocusIcon size={13} className="text-blue-500" />,
  todo: <CheckCircle2Icon size={13} className="text-green-500" />,
  break: <CoffeeIcon size={13} className="text-emerald-500" />,
}

const DOT_MAP = {
  pomodoro: "bg-orange-500",
  focus: "bg-blue-500",
  todo: "bg-green-500",
  break: "bg-emerald-500",
}

function ActivityRow({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${DOT_MAP[item.type]}`} />
        {!isLast && <div className="mt-1 w-px flex-1 bg-border/50" />}
      </div>
      <div className="flex-1 pb-3 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-foreground truncate">{item.title}</p>
          {ICON_MAP[item.type]}
        </div>
        {item.detail && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{item.detail}</p>
        )}
        <p className="text-[11px] text-muted-foreground/60 tabular-nums mt-0.5">
          {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="mt-1 h-2 w-2 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5 pb-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export function ActivityTimeline() {
  const { data: pomodoroData, isLoading: pomodoroLoading } = usePomodoroHistory({ limit: 5, status: "COMPLETED" })
  const { data: focusData, isLoading: focusLoading } = useFocusHistory({ limit: 5, status: "COMPLETED" })
  const { data: todosData, isLoading: todosLoading } = useTodos({ limit: 5, sortBy: "createdAt", sortOrder: "desc" })

  const isLoading = pomodoroLoading || focusLoading || todosLoading

  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [
      ...(pomodoroData?.data.sessions ?? []).flatMap((s) => {
        const items_: ActivityItem[] = []
        if (s.endedAt) {
          items_.push({
            id: `${s.id}-work`,
            type: s.type === "WORK" ? "pomodoro" : "break",
            title: s.type === "WORK" ? `Completed ${s.plannedMinutes}min pomodoro` : `Completed ${s.plannedMinutes}min break`,
            time: s.endedAt,
            detail: s.type === "WORK" ? "Work session" : "Break session",
          })
        }
        return items_
      }),
      ...(focusData?.data.sessions ?? []).map((s) => ({
        id: s.id,
        type: "focus" as const,
        title: `Focus session — ${s.actualMinutes ?? s.plannedMinutes}min`,
        time: s.endedAt ?? s.updatedAt,
        detail: s.goal ? `"${s.goal}"` : s.mode === "STRICT" ? "Strict mode" : undefined,
      })),
      ...(todosData?.data.todos ?? [])
        .filter((t) => t.status === "DONE" && t.completedAt)
        .map((t) => ({
          id: t.id,
          type: "todo" as const,
          title: `Completed "${t.title}"`,
          time: t.completedAt!,
        })),
    ]
    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8)
  }, [pomodoroData, focusData, todosData])

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Recent Activity"
        subtitle={activities.length > 0 ? `Last ${activities.length} events` : undefined}
      />

      <div className="mt-3">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => <ActivitySkeleton key={i} />)}
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon size={20} />}
            title="No activity yet"
            description="Complete a task to see your timeline"
          />
        ) : (
          <div>
            {activities.map((item, i) => (
              <ActivityRow key={`${item.type}-${item.id}`} item={item} isLast={i === activities.length - 1} />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
