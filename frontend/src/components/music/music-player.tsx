"use client"

import { PlaybackControls } from "./playback-controls"
import { VolumeSlider } from "./volume-slider"
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
      <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card/50 p-3 shadow-soft">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </div>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-card/50 p-3 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {isPlaying && (
            <span className="flex shrink-0 items-end gap-[2px]" aria-hidden>
              <span className="h-3 w-[3px] rounded-full bg-cyan-500 animate-pulse" />
              <span className="h-2 w-[3px] rounded-full bg-cyan-500 animate-pulse [animation-delay:0.15s]" />
              <span className="h-3.5 w-[3px] rounded-full bg-cyan-500 animate-pulse [animation-delay:0.3s]" />
            </span>
          )}
          <p className="truncate text-xs font-semibold text-foreground">
            {trackName ?? "No track selected"}
          </p>
        </div>
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40 shadow-[inset_0_1px_2px_oklch(0_0_0/0.05)] dark:bg-white/[0.06]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_12px_-2px_oklch(0.66_0.11_110/0.55)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

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
