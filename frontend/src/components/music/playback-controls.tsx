"use client"

import { PlayIcon, PauseIcon, SquareIcon, RepeatIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PlaybackControlsProps {
  isPlaying: boolean
  loop: boolean
  disabled?: boolean
  onTogglePlay: () => void
  onStop: () => void
  onToggleLoop: () => void
}

export function PlaybackControls({
  isPlaying,
  loop,
  disabled,
  onTogglePlay,
  onStop,
  onToggleLoop,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="default"
        size="icon"
        className="size-8 rounded-lg"
        disabled={disabled}
        onClick={onTogglePlay}
      >
        {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg"
        disabled={disabled}
        onClick={onStop}
      >
        <SquareIcon size={11} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-8 rounded-lg", loop && "text-primary bg-primary/5")}
        onClick={onToggleLoop}
      >
        <RepeatIcon size={13} />
      </Button>
    </div>
  )
}
