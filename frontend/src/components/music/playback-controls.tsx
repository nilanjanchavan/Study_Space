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
    <div className="flex items-center gap-1.5">
      <Button
        variant="default"
        size="icon"
        className={cn(
          "size-11 rounded-full",
          isPlaying && "shadow-[0_0_24px_-6px_oklch(0.66_0.11_110/0.6)]"
        )}
        disabled={disabled}
        onClick={onTogglePlay}
      >
        {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-lg"
        disabled={disabled}
        onClick={onStop}
      >
        <SquareIcon size={13} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-9 rounded-lg", loop && "bg-cyan-500/10 text-cyan-500")}
        onClick={onToggleLoop}
      >
        <RepeatIcon size={14} />
      </Button>
    </div>
  )
}
