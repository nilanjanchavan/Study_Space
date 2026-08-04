"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { BadgeRunning } from "@/components/design-system/premium-badge"
import { TargetIcon, ClockIcon, ShieldIcon, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { FocusSessionItem } from "@/types"

interface FocusSessionInfoProps {
  session: FocusSessionItem
}

export function FocusSessionInfo({ session }: FocusSessionInfoProps) {
  const startedAt = new Date(session.startedAt)
  const expectedEnd = new Date(startedAt.getTime() + session.plannedMinutes * 60 * 1000)

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Session Details</h3>
        <BadgeRunning>Live</BadgeRunning>
      </div>

      <div className="space-y-2.5">
        {session.goal && (
          <div className="flex items-start gap-2.5">
            <TargetIcon size={14} className="text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Goal</p>
              <p className="text-sm font-medium text-foreground leading-snug break-words">{session.goal}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <ClockIcon size={14} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground">Duration</p>
            <p className="text-sm font-medium text-foreground">{session.plannedMinutes} minutes</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ShieldIcon size={14} className={session.strictModeEnabled ? "text-amber-500 shrink-0" : "text-muted-foreground shrink-0"} />
          <div>
            <p className="text-[11px] text-muted-foreground">Strict Mode</p>
            <p className="text-sm font-medium text-foreground">{session.strictModeEnabled ? "Enabled" : "Disabled"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <CalendarIcon size={14} className="text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground">Started</p>
            <p className="text-sm font-medium text-foreground tabular-nums">{format(startedAt, "h:mm a")}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">Expected Finish</p>
            <p className="text-sm font-medium text-foreground tabular-nums">{format(expectedEnd, "h:mm a")}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
