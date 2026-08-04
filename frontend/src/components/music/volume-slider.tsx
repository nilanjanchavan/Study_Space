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
        className="text-muted-foreground shrink-0 cursor-pointer hover:text-foreground transition-colors"
        onClick={() => onChange(volume === 0 ? 50 : 0)}
      />
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border/80",
          "[&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_oklch(0_0_0/0.06)]",
          "[&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer",
        )}
      />
      <span className="text-[10px] text-muted-foreground w-7 text-right tabular-nums">
        {volume}%
      </span>
    </div>
  )
}
