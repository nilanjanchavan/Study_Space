"use client"

import { TRACKS } from "@/lib/tracks"
import { TrackItem } from "./track-item"
import { TrackListSkeleton } from "./track-list-skeleton"

interface TrackListProps {
  currentTrackId: string | null
  isPlaying: boolean
  onSelect: (trackId: string) => void
  isLoading?: boolean
}

export function TrackList({ currentTrackId, isPlaying, onSelect, isLoading }: TrackListProps) {
  if (isLoading) return <TrackListSkeleton />

  return (
    <div className="flex flex-col gap-0.5">
      {TRACKS.map((track) => (
        <TrackItem
          key={track.id}
          track={track}
          isActive={track.id === currentTrackId}
          isPlaying={track.id === currentTrackId && isPlaying}
          onSelect={() => onSelect(track.id)}
        />
      ))}
    </div>
  )
}
