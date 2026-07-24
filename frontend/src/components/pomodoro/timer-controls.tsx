"use client"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import {
  PlayIcon,
  PauseIcon,
  StopCircleIcon,
  CheckIcon,
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
      <Button size="lg" onClick={onStart} disabled={isBusy}>
        {isStarting ? <LoadingSpinner size={16} /> : <PlayIcon />}
        Start
      </Button>
    )
  }

  if (status === "RUNNING") {
    return (
      <div className="flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={onPause} disabled={isBusy}>
          {isPausing ? <LoadingSpinner size={16} /> : <PauseIcon />}
          Pause
        </Button>
        <Button size="lg" onClick={onComplete} disabled={isBusy}>
          {isCompleting ? <LoadingSpinner size={16} /> : <CheckIcon />}
          Complete
        </Button>
        <Button variant="destructive" size="lg" onClick={onCancel} disabled={isBusy}>
          {isCancelling ? <LoadingSpinner size={16} /> : <StopCircleIcon />}
          Cancel
        </Button>
      </div>
    )
  }

  if (status === "PAUSED") {
    return (
      <div className="flex items-center gap-3">
        <Button size="lg" onClick={onResume} disabled={isBusy}>
          {isResuming ? <LoadingSpinner size={16} /> : <PlayIcon />}
          Resume
        </Button>
        <Button variant="destructive" size="lg" onClick={onCancel} disabled={isBusy}>
          {isCancelling ? <LoadingSpinner size={16} /> : <StopCircleIcon />}
          Cancel
        </Button>
      </div>
    )
  }

  if (status === "COMPLETED") {
    const label = completedType ? NEXT_LABELS[completedType] ?? "Start" : "Start"
    return (
      <Button size="lg" onClick={onStart} disabled={isBusy}>
        {isStarting ? <LoadingSpinner size={16} /> : <PlayIcon />}
        {label}
      </Button>
    )
  }

  return null
}
