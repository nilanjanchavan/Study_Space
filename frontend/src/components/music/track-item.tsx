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
        "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150",
        isActive
          ? "bg-cyan-500/[0.08] text-cyan-500 ring-1 ring-cyan-500/15"
          : "text-muted-foreground hover:-translate-y-px hover:bg-muted/30 hover:text-foreground hover:shadow-soft active:translate-y-0 active:shadow-pressed"
      )}
    >
      {isActive && (
        <span className="absolute left-0.5 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-cyan-500 shadow-[0_0_8px_-1px_oklch(0.66_0.11_110/0.6)]" />
      )}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          isActive ? "bg-cyan-500/15" : "bg-muted/50 group-hover:bg-muted"
        )}
      >
        {isActive && isPlaying ? (
          <div className="flex items-center gap-[3px]">
            <span className="w-[3px] h-3 bg-cyan-500 rounded-full animate-pulse" />
            <span className="w-[3px] h-2 bg-cyan-500 rounded-full animate-pulse [animation-delay:0.15s]" />
            <span className="w-[3px] h-3.5 bg-cyan-500 rounded-full animate-pulse [animation-delay:0.3s]" />
          </div>
        ) : isActive ? (
          <PauseIcon size={13} className="text-cyan-500" />
        ) : (
          <span className="text-xs">{CATEGORY_ICONS[track.category] ?? "🎵"}</span>
        )}
      </div>
      <span className="truncate flex-1 font-medium">{track.name}</span>
      {isActive && isPlaying && (
        <PlayIcon size={11} className="shrink-0 text-cyan-500" />
      )}
    </button>
  )
}
