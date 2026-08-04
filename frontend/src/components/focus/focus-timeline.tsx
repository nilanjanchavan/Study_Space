"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
import {
  PlayIcon,
  CheckCircle2Icon,
  CoffeeIcon,
  ShieldAlertIcon,
  TargetIcon,
  SquareIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimelineEvent {
  id: string
  type: "session_start" | "pomodoro_complete" | "break_start" | "break_end" | "strict_violation" | "session_end" | "focus_complete"
  label: string
  detail?: string
  timestamp: Date
}

interface FocusTimelineProps {
  events: TimelineEvent[]
}

const EVENT_CONFIG: Record<TimelineEvent["type"], {
  icon: React.ComponentType<{ size?: number; className?: string }>
  dotColor: string
}> = {
  session_start: { icon: PlayIcon, dotColor: "bg-primary" },
  pomodoro_complete: { icon: CheckCircle2Icon, dotColor: "bg-success" },
  break_start: { icon: CoffeeIcon, dotColor: "bg-emerald-500" },
  break_end: { icon: CoffeeIcon, dotColor: "bg-emerald-500/60" },
  strict_violation: { icon: ShieldAlertIcon, dotColor: "bg-destructive" },
  session_end: { icon: SquareIcon, dotColor: "bg-muted-foreground/40" },
  focus_complete: { icon: TargetIcon, dotColor: "bg-amber-500" },
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function FocusTimeline({ events }: FocusTimelineProps) {
  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Session Timeline"
        subtitle={`${events.length} events`}
      />

      <div className="mt-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 text-center py-6">
            Timeline events will appear here as your session progresses
          </p>
        ) : (
          <div className="space-y-0">
            {events.map((event, i) => {
              const config = EVENT_CONFIG[event.type]
              const Icon = config.icon
              const isLast = i === events.length - 1

              return (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", config.dotColor)} />
                    {!isLast && <div className="mt-1 w-px flex-1 bg-border/40" />}
                  </div>
                  <div className="flex-1 pb-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon size={13} className="text-muted-foreground shrink-0" />
                      <p className="text-sm font-medium text-foreground">{event.label}</p>
                    </div>
                    {event.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5 ml-5 break-words">{event.detail}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/50 tabular-nums mt-0.5 ml-5">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
