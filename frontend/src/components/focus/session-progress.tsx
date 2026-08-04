"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { ProgressBar } from "@/components/design-system/progress"
import { CheckCircleIcon, XCircleIcon, ClockIcon, ZapIcon } from "lucide-react"
import type { FocusSessionItem } from "@/types"

interface SessionProgressProps {
  session: FocusSessionItem
  completedWorkCount: number
  completedBreakCount: number
  distractions: number
  currentCycle: number
  totalCycles: number
  elapsed: number
}

export function SessionProgress({
  session,
  completedWorkCount,
  completedBreakCount,
  distractions,
  currentCycle,
  totalCycles,
  elapsed,
}: SessionProgressProps) {
  const focusPlanned = session.plannedMinutes * 60 * 1000
  const focusPercent = Math.min(100, Math.round((elapsed / focusPlanned) * 100))
  const remaining = Math.max(0, Math.ceil((focusPlanned - elapsed) / 60000))
  const cyclePercent = Math.round((completedWorkCount / totalCycles) * 100)

  return (
    <GlassCard className="p-4">
      <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">Session Progress</h3>

      {/* Overall progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-foreground font-medium">Overall</span>
          <span className="text-xs text-muted-foreground tabular-nums">{focusPercent}%</span>
        </div>
        <ProgressBar value={focusPercent} size="sm" />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-muted-foreground/60 tabular-nums">
            {formatElapsed(elapsed)}
          </span>
          <span className="text-[11px] text-muted-foreground/60 tabular-nums">
            {remaining}m remaining
          </span>
        </div>
      </div>

      {/* Cycle progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-foreground font-medium">Cycle</span>
          <span className="text-xs text-muted-foreground tabular-nums">{currentCycle} / {totalCycles}</span>
        </div>
        <ProgressBar value={cyclePercent} size="sm" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <StatRow
          icon={<CheckCircleIcon size={13} className="text-success" />}
          label="Pomodoros"
          value={String(completedWorkCount)}
        />
        <StatRow
          icon={<XCircleIcon size={13} className="text-muted-foreground/60" />}
          label="Cancelled"
          value={String(session.cancelledPomodoros)}
        />
        <StatRow
          icon={<ClockIcon size={13} className="text-blue-500" />}
          label="Breaks"
          value={String(completedBreakCount)}
        />
        <StatRow
          icon={<ZapIcon size={13} className="text-amber-500" />}
          label="Distractions"
          value={String(distractions)}
        />
      </div>
    </GlassCard>
  )
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`
  return `${minutes}m`
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-2.5 py-2">
      {icon}
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
        <span className="text-sm font-semibold tabular-nums mt-0.5">{value}</span>
      </div>
    </div>
  )
}
