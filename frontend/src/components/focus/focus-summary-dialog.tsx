"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TargetIcon,
  ClockIcon,
  CheckCircleIcon,
  CoffeeIcon,
  EyeOffIcon,
  ShieldIcon,
  XCircleIcon,
} from "lucide-react"
import type { FocusSessionItem } from "@/types"

function formatMinutes(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatCompletionTime(session: FocusSessionItem): string {
  const ended = session.endedAt ? new Date(session.endedAt) : new Date()
  return ended.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

interface FocusSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: FocusSessionItem | null
  completedWorkCount: number
  completedBreakCount: number
  distractions: number
  endedBy: "natural" | "giveup" | "strict" | null
  startNewSession?: () => void
}

export function FocusSummaryDialog({
  open,
  onOpenChange,
  session,
  completedWorkCount,
  completedBreakCount,
  distractions,
  endedBy,
  startNewSession,
}: FocusSummaryDialogProps) {
  if (!session) return null

  const focusMinutes = session.actualMinutes ?? Math.floor(session.elapsedMs / 60000)
  const status = endedBy === "natural" ? "Completed" : "Abandoned"
  const statusColor = endedBy === "natural" ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"

  const title = endedBy === "natural" ? "\uD83C\uDF89 Focus Session Complete" : "Session Summary"

  const handleStartNewSession = () => {
    onOpenChange(false)
    startNewSession?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {endedBy === "natural"
              ? "Great job! Your focus session has ended."
              : "Your focus session was ended early."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {session.goal && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <TargetIcon size={14} className="text-muted-foreground shrink-0" />
              <span className="text-sm truncate">{session.goal}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <SummaryItem
              icon={<ClockIcon size={14} />}
              label="Focus Time"
              value={formatMinutes(focusMinutes * 60 * 1000)}
            />
            <SummaryItem
              icon={<CheckCircleIcon size={14} className="text-emerald-600 dark:text-emerald-400" />}
              label="Pomodoros"
              value={String(completedWorkCount)}
            />
            <SummaryItem
              icon={<CoffeeIcon size={14} />}
              label="Breaks Taken"
              value={String(completedBreakCount)}
            />
            <SummaryItem
              icon={<EyeOffIcon size={14} />}
              label="Distractions"
              value={String(distractions)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2">
              <ClockIcon size={14} className="text-muted-foreground" />
              <span className="text-sm">Completed At</span>
            </div>
            <span className="text-sm font-medium tabular-nums">{formatCompletionTime(session)}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2">
              <ShieldIcon size={14} className="text-muted-foreground" />
              <span className="text-sm">Strict Mode</span>
            </div>
            <Badge variant={session.strictModeEnabled ? "default" : "secondary"} className="text-xs">
              {session.strictModeEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2">
              {endedBy === "natural" ? (
                <CheckCircleIcon size={14} className={statusColor} />
              ) : (
                <XCircleIcon size={14} className={statusColor} />
              )}
              <span className="text-sm">Status</span>
            </div>
            <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {endedBy === "natural" && startNewSession && (
            <Button variant="outline" onClick={handleStartNewSession}>
              Start New Session
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}
