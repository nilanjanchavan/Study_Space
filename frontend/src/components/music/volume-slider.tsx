"use client"

import { VolumeIcon, Volume1Icon, Volume2Icon, VolumeXIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface VolumeSliderProps {
  volume: number
  onChange: (v: number) => void
}

export function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  const VolumeIconComponent =
    volume === 0 ? VolumeXIcon
    : volume < 33 ? VolumeIcon
    : volume < 66 ? Volume1Icon
    : Volume2Icon

  return (
    <div className="flex items-center gap-2">
      <VolumeIconComponent
        size={13}
        className="text-muted-foreground shrink-0 cursor-pointer transition-colors hover:text-cyan-500/80"
        onClick={() => onChange(volume === 0 ? 50 : 0)}
      />
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted/40 accent-cyan-500 dark:bg-white/[0.08]",
          "[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_-1px_oklch(0.66_0.11_110/0.6)]",
          "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer",
        )}
      />
      <span className="w-7 text-right text-[10px] tabular-nums text-muted-foreground">
        {volume}%
      </span>
    </div>
  )
}
