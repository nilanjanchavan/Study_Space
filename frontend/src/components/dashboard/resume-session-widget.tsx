"use client"

import { useRouter } from "next/navigation"
import { useCurrentPomodoro } from "@/hooks/use-pomodoro"
import { useCurrentFocus } from "@/hooks/use-focus"
import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
import { Button } from "@/components/ui/button"
import { BadgeRunning, BadgePaused } from "@/components/design-system/premium-badge"
import { Skeleton } from "@/components/design-system/skeleton"
import { PlayIcon, FocusIcon, TimerIcon, ArrowRightIcon } from "lucide-react"

export function ResumeSessionWidget() {
  const router = useRouter()
  const { data: pomodoro, isLoading: pomLoading } = useCurrentPomodoro()
  const { data: focus, isLoading: focLoading } = useCurrentFocus()

  const pomSession = pomodoro?.data.session
  const focSession = focus?.data.session
  const isLoading = pomLoading || focLoading

  if (isLoading) {
    return (
      <GlassCard className="p-4 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-8 w-1/3" />
      </GlassCard>
    )
  }

  if (pomSession && (pomSession.status === "RUNNING" || pomSession.status === "PAUSED")) {
    const isPaused = pomSession.status === "PAUSED"
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
              <TimerIcon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Pomodoro in Progress</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {isPaused ? <BadgePaused>Paused</BadgePaused> : <BadgeRunning>Focusing</BadgeRunning>}
                <span className="text-xs text-muted-foreground truncate">{pomSession.plannedMinutes}min session</span>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push("/pomodoro")} className="gap-1.5 shrink-0">
            <ArrowRightIcon size={14} />
            Resume
          </Button>
        </div>
      </GlassCard>
    )
  }

  if (focSession && (focSession.status === "RUNNING" || focSession.status === "PAUSED")) {
    const isPaused = focSession.status === "PAUSED"
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <FocusIcon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Focus Session</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {isPaused ? <BadgePaused>Paused</BadgePaused> : <BadgeRunning>Active</BadgeRunning>}
                <span className="text-xs text-muted-foreground truncate">{focSession.goal || `${focSession.plannedMinutes}min focus`}</span>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push("/focus")} className="gap-1.5 shrink-0">
            <ArrowRightIcon size={14} />
            Resume
          </Button>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4">
      <SectionHeader title="Start Something" />
      <div className="mt-3 flex gap-2">
        <Button onClick={() => router.push("/pomodoro")} variant="outline" className="flex-1 gap-1.5">
          <PlayIcon size={14} />
          Pomodoro
        </Button>
        <Button onClick={() => router.push("/focus")} variant="outline" className="flex-1 gap-1.5">
          <FocusIcon size={14} />
          Focus
        </Button>
      </div>
    </GlassCard>
  )
}
