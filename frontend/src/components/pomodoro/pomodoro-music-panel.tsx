"use client"

import { useMusic } from "@/providers/music-provider"
import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
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
    <GlassCard tone="cyan" className="p-4">
      <SectionHeader
        title="Ambient Music"
        subtitle={currentTrack ? `${isPlaying ? "Playing" : "Paused"} · ${currentTrack.name}` : undefined}
        accent={{
          icon: isPlaying ? <WavesIcon size={14} /> : <MusicIcon size={14} />,
          className: cn(
            "transition-colors",
            isPlaying ? "bg-cyan-500/10 text-cyan-500" : "bg-cyan-500/5 text-cyan-500/60"
          ),
        }}
      />

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
