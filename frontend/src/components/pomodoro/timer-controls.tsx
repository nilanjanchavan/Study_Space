"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/design-system/skeleton"
import {
  PlayIcon,
  PauseIcon,
  StopCircleIcon,
  CheckIcon,
  SkipForwardIcon,
} from "lucide-react"

interface TimerControlsProps {
  status: string
  completedType: string | null
  currentMode?: string
  isStarting: boolean
  isPausing: boolean
  isResuming: boolean
  isCompleting: boolean
  isCancelling: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onComplete: () => void
  onCancel: () => void
}

const NEXT_LABELS: Record<string, string> = {
  WORK: "Start Short Break",
  SHORT_BREAK: "Start Work",
  LONG_BREAK: "Start Work",
}

export function TimerControls({
  status,
  completedType,
  currentMode,
  isStarting,
  isPausing,
  isResuming,
  isCompleting,
  isCancelling,
  onStart,
  onPause,
  onResume,
  onComplete,
  onCancel,
}: TimerControlsProps) {
  const isBusy = isStarting || isPausing || isResuming || isCompleting || isCancelling

  if (status === "IDLE") {
    const idleLabel =
      currentMode === "SHORT_BREAK"
        ? "Start Short Break"
        : currentMode === "LONG_BREAK"
        ? "Start Long Break"
        : "Start Focus Session"

    return (
      <Button
        size="lg"
        onClick={onStart}
        disabled={isBusy}
        className="h-11 px-7 rounded-xl gap-2.5 font-medium shadow-sm"
      >
        {isStarting ? <Spinner size={18} className="shrink-0" /> : <PlayIcon size={18} className="shrink-0" />}
        <span>{idleLabel}</span>
      </Button>
    )
  }

  if (status === "RUNNING") {
    return (
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={onPause}
          disabled={isBusy}
          className="h-11 px-5 rounded-xl gap-2 font-medium"
        >
          {isPausing ? <Spinner size={15} className="shrink-0" /> : <PauseIcon size={15} className="shrink-0" />}
          <span>Pause</span>
        </Button>
        <Button
          size="lg"
          onClick={onComplete}
          disabled={isBusy}
          className="h-11 px-5 rounded-xl gap-2 font-medium shadow-sm"
        >
          {isCompleting ? <Spinner size={15} className="shrink-0" /> : <CheckIcon size={15} className="shrink-0" />}
          <span>Complete</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isBusy}
          className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive"
          title="Cancel session"
        >
          {isCancelling ? <Spinner size={15} className="shrink-0" /> : <StopCircleIcon size={16} className="shrink-0" />}
        </Button>
      </div>
    )
  }

  if (status === "PAUSED") {
    return (
      <div className="flex items-center gap-3">
        <Button
          size="lg"
          onClick={onResume}
          disabled={isBusy}
          className="h-11 px-7 rounded-xl gap-2.5 font-medium shadow-sm"
        >
          {isResuming ? <Spinner size={16} className="shrink-0" /> : <PlayIcon size={16} className="shrink-0" />}
          <span>Resume</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isBusy}
          className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive"
          title="Cancel session"
        >
          {isCancelling ? <Spinner size={15} className="shrink-0" /> : <StopCircleIcon size={16} className="shrink-0" />}
        </Button>
      </div>
    )
  }

  if (status === "COMPLETED") {
    const label = completedType ? NEXT_LABELS[completedType] ?? "Start" : "Start"
    return (
      <Button
        size="lg"
        onClick={onStart}
        disabled={isBusy}
        className="h-11 px-7 rounded-xl gap-2.5 font-medium shadow-sm"
      >
        {isStarting ? <Spinner size={18} className="shrink-0" /> : <SkipForwardIcon size={18} className="shrink-0" />}
        <span>{label}</span>
      </Button>
    )
  }

  return null
}
