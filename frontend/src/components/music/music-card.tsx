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
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MusicIcon size={16} className="text-muted-foreground" />
          <CardTitle className="text-sm">Ambient Music</CardTitle>
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
