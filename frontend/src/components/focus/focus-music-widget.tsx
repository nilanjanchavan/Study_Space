"use client"

import { useMusic } from "@/providers/music-provider"
import { GlassCard } from "@/components/design-system/glass-card"
import { Button } from "@/components/ui/button"
import { PauseIcon, PlayIcon, MusicIcon, VolumeIcon, VolumeXIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function MiniWaveform({ isPlaying }: { isPlaying: boolean }) {
  const bars = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3]
  return (
    <div className="flex items-end gap-[2px] h-4">
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-full transition-all duration-300",
            isPlaying ? "bg-primary/70" : "bg-muted-foreground/20"
          )}
          style={{
            height: isPlaying ? `${height * 100}%` : "4px",
            animationDelay: isPlaying ? `${i * 100}ms` : undefined,
          }}
        />
      ))}
    </div>
  )
}

export function FocusMusicWidget() {
  const { currentTrack, isPlaying, pause, resume, volume, setVolume } = useMusic()

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <MusicIcon size={14} className={cn("text-muted-foreground/40", isPlaying && "text-primary animate-pulse-soft")} />
        <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Ambience</h3>
      </div>

      {currentTrack ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MiniWaveform isPlaying={isPlaying} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentTrack.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentTrack.category}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={isPlaying ? pause : resume}
              >
                {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {volume > 0 ? (
                <VolumeIcon size={13} className="text-muted-foreground" />
              ) : (
                <VolumeXIcon size={13} className="text-muted-foreground" />
              )}
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-border/80 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_oklch(0_0_0/0.06)] [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
              <span className="text-[10px] text-muted-foreground/60 tabular-nums w-6 text-right">{volume}%</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/50 py-2">
          No music playing
        </p>
      )}
    </GlassCard>
  )
}
