"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrackList } from "./track-list"
import { MusicPlayer } from "./music-player"
import { useMusic } from "@/providers/music-provider"
import { MusicIcon } from "lucide-react"

export function MusicCard() {
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
    <Card className="h-fit transition-all duration-300 hover:-translate-y-0.5 hover:shadow-medium hover:ring-foreground/[0.08] dark:hover:ring-white/[0.1]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2.5">
          <CardTitle className="text-sm">Ambient Music</CardTitle>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 via-cyan-400/10 to-sky-400/15 text-cyan-500 ring-1 ring-cyan-500/20">
            <MusicIcon size={15} />
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <TrackList
          currentTrackId={currentTrack?.id ?? null}
          isPlaying={isPlaying}
          onSelect={togglePlay}
        />

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
      </CardContent>
    </Card>
  )
}
