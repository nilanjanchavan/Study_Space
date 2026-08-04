"use client"

import { useMusic } from "@/providers/music-provider"
import { GlassCard } from "@/components/design-system/glass-card"
import { TrackList } from "@/components/music/track-list"
import { MusicPlayer } from "@/components/music/music-player"
import { MusicIcon, WavesIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function PomodoroMusicPanel() {
  const {
    currentTrack,
    isPlaying,
    volume,
    loop,
    currentTime,
    duration,
    isLoading,
    togglePlay,
    stop,
    setVolume,
    toggleLoop,
  } = useMusic()

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
          isPlaying ? "bg-primary/10" : "bg-muted"
        )}>
          {isPlaying ? (
            <WavesIcon size={14} className="text-primary animate-pulse" />
          ) : (
            <MusicIcon size={14} className="text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate">Ambient Music</h3>
          {currentTrack && (
            <p className="text-[11px] text-muted-foreground truncate">
              {isPlaying ? "Playing" : "Paused"} &middot; {currentTrack.name}
            </p>
          )}
        </div>
      </div>

      <div className="max-h-[280px] overflow-y-auto -mx-1 px-1 mb-4">
        <TrackList
          currentTrackId={currentTrack?.id ?? null}
          isPlaying={isPlaying}
          onSelect={togglePlay}
        />
      </div>

      <MusicPlayer
        trackName={currentTrack?.name ?? null}
        isPlaying={isPlaying}
        loop={loop}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isLoading={isLoading}
        onTogglePlay={() => {
          if (currentTrack) togglePlay(currentTrack.id)
        }}
        onStop={stop}
        onToggleLoop={toggleLoop}
        onVolumeChange={setVolume}
      />
    </GlassCard>
  )
}
