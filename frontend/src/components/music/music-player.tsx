"use client"

import { PlaybackControls } from "./playback-controls"
import { VolumeSlider } from "./volume-slider"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/design-system/skeleton"

interface MusicPlayerProps {
  trackName: string | null
  isPlaying: boolean
  loop: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
  onTogglePlay: () => void
  onStop: () => void
  onToggleLoop: () => void
  onVolumeChange: (v: number) => void
}

function formatTime(s: number): string {
  if (!s || !isFinite(s)) return "0:00"
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60)
  return `${mins}:${String(secs).padStart(2, "0")}`
}

export function MusicPlayer({
  trackName,
  isPlaying,
  loop,
  currentTime,
  duration,
  volume,
  isLoading,
  onTogglePlay,
  onStop,
  onToggleLoop,
  onVolumeChange,
}: MusicPlayerProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-3 rounded-xl bg-muted/30">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl bg-muted/30">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground truncate">
          {trackName ?? "No track selected"}
        </p>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <Progress
        value={duration > 0 ? (currentTime / duration) * 100 : 0}
        className="h-1.5"
      />

      <div className="flex items-center gap-3">
        <PlaybackControls
          isPlaying={isPlaying}
          loop={loop}
          disabled={!trackName}
          onTogglePlay={onTogglePlay}
          onStop={onStop}
          onToggleLoop={onToggleLoop}
        />
        <div className="flex-1">
          <VolumeSlider volume={volume} onChange={onVolumeChange} />
        </div>
      </div>
    </div>
  )
}
