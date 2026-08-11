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
    return (
      <Button
        size="lg"
        onClick={onStart}
        disabled={isBusy}
        className="h-11 px-6 rounded-xl gap-2"
      >
        Start Session
        {isStarting ? <Spinner size={18} /> : <PlayIcon size={18} />}
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
          className="h-11 px-4 sm:px-5 rounded-xl gap-2"
        >
          Pause
          {isPausing ? <Spinner size={14} /> : <PauseIcon size={14} />}
        </Button>
        <Button
          size="lg"
          onClick={onComplete}
          disabled={isBusy}
          className="h-11 px-4 sm:px-5 rounded-xl gap-2"
        >
          Complete
          {isCompleting ? <Spinner size={14} /> : <CheckIcon size={14} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isBusy}
          className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive"
          title="Cancel session"
        >
          {isCancelling ? <Spinner size={14} /> : <StopCircleIcon size={16} />}
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
          className="h-11 px-6 rounded-xl gap-2"
        >
          Resume
          {isResuming ? <Spinner size={16} /> : <PlayIcon size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isBusy}
          className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive"
          title="Cancel session"
        >
          {isCancelling ? <Spinner size={16} /> : <StopCircleIcon size={16} />}
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
        className="h-11 px-6 rounded-xl gap-2"
      >
        {label}
        {isStarting ? <Spinner size={18} /> : <SkipForwardIcon size={18} />}
      </Button>
    )
  }

  return null
}
