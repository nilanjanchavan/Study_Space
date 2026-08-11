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
        <SectionHeader
          title="Pomodoro in Progress"
          accent={{ icon: <TimerIcon size={14} />, className: "bg-orange-500/10 text-orange-500" }}
          action={
            <Button onClick={() => router.push("/pomodoro")} className="gap-2 shrink-0">
              Resume
              <ArrowRightIcon size={14} />
            </Button>
          }
        />
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {isPaused ? <BadgePaused>Paused</BadgePaused> : <BadgeRunning>Focusing</BadgeRunning>}
          <span className="text-xs text-muted-foreground truncate">{pomSession.plannedMinutes}min session</span>
        </div>
      </GlassCard>
    )
  }

  if (focSession && (focSession.status === "RUNNING" || focSession.status === "PAUSED")) {
    const isPaused = focSession.status === "PAUSED"
    return (
      <GlassCard className="p-4">
        <SectionHeader
          title="Focus Session"
          accent={{ icon: <FocusIcon size={14} />, className: "bg-blue-500/10 text-blue-500" }}
          action={
            <Button onClick={() => router.push("/focus")} className="gap-2 shrink-0">
              Resume
              <ArrowRightIcon size={14} />
            </Button>
          }
        />
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {isPaused ? <BadgePaused>Paused</BadgePaused> : <BadgeRunning>Active</BadgeRunning>}
          <span className="text-xs text-muted-foreground truncate">{focSession.goal || `${focSession.plannedMinutes}min focus`}</span>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4">
      <SectionHeader title="Start Something" />
      <div className="mt-3 flex gap-2">
        <Button onClick={() => router.push("/pomodoro")} variant="outline" className="flex-1 gap-2">
          Pomodoro
          <PlayIcon size={14} />
        </Button>
        <Button onClick={() => router.push("/focus")} variant="outline" className="flex-1 gap-2">
          Focus
          <FocusIcon size={14} />
        </Button>
      </div>
    </GlassCard>
  )
}
