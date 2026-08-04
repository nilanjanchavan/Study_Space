"use client"

import { useMusic } from "@/providers/music-provider"
import { GlassCard } from "@/components/design-system/glass-card"
import { Button } from "@/components/ui/button"
import { PauseIcon, PlayIcon, MusicIcon, VolumeIcon, VolumeXIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function MiniWaveform({ isPlaying }: { isPlaying: boolean }) {
  const bars = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3]
  const durations = ["0.7s", "0.8s", "0.6s", "0.9s", "0.65s", "0.75s", "0.85s"]
  return (
    <div className="flex items-end gap-[2px] h-4">
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-full transition-all duration-300",
            isPlaying ? "bg-primary/60 animate-pulse-soft" : "bg-muted-foreground/20"
          )}
          style={{
            height: isPlaying ? `${height * 100}%` : "3px",
            animationDelay: isPlaying ? `${i * 100}ms` : undefined,
            animationDuration: isPlaying ? durations[i] : undefined,
          }}
        />
      ))}
    </div>
  )
}

export function MusicWidget() {
  const { currentTrack, isPlaying, volume, pause, resume, setVolume } = useMusic()

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <MusicIcon size={14} className={cn("text-muted-foreground/40", isPlaying && "text-primary animate-pulse-soft")} />
        <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Ambience</h3>
      </div>

      {currentTrack ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <MiniWaveform isPlaying={isPlaying} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{currentTrack.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentTrack.category}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={isPlaying ? pause : resume}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {volume === 0 ? <VolumeXIcon size={12} className="text-muted-foreground/40" /> : <VolumeIcon size={12} className="text-muted-foreground/40" />}
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none bg-muted/60 accent-primary cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              aria-label="Volume"
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/50">
          No music playing
        </p>
      )}
    </GlassCard>
  )
}
