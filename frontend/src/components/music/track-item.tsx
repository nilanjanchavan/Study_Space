"use client"

import { PlayIcon, PauseIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Track } from "@/lib/tracks"

interface TrackItemProps {
  track: Track
  isActive: boolean
  isPlaying: boolean
  onSelect: () => void
}

const CATEGORY_ICONS: Record<string, string> = {
  nature: "🌿",
  ambient: "🔥",
  urban: "☕",
}

export function TrackItem({ track, isActive, isPlaying, onSelect }: TrackItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 text-left w-full group",
        isActive
          ? "bg-primary/[0.08] text-foreground ring-1 ring-primary/10"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
        isActive ? "bg-primary/15" : "bg-muted/60 group-hover:bg-muted"
      )}>
        {isActive && isPlaying ? (
          <div className="flex items-center gap-[3px]">
            <span className="w-[3px] h-3 bg-primary rounded-full animate-pulse" />
            <span className="w-[3px] h-2 bg-primary rounded-full animate-pulse [animation-delay:0.15s]" />
            <span className="w-[3px] h-3.5 bg-primary rounded-full animate-pulse [animation-delay:0.3s]" />
          </div>
        ) : isActive ? (
          <PauseIcon size={13} className="text-primary" />
        ) : (
          <span className="text-xs">{CATEGORY_ICONS[track.category] ?? "🎵"}</span>
        )}
      </div>
      <span className="truncate flex-1 font-medium">{track.name}</span>
      {isActive && isPlaying && (
        <PlayIcon size={11} className="text-primary shrink-0" />
      )}
    </button>
  )
}
