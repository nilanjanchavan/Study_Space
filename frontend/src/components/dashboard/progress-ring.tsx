"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({ value, max, size = 120, strokeWidth = 8, className }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedMax = Math.max(max, 1)
  const clampedValue = Math.min(value, clampedMax)
  const progress = clampedValue / clampedMax
  const offset = circumference * (1 - progress)

  const color = useMemo(() => {
    if (progress >= 1) return "oklch(0.6 0.12 160)"
    if (progress >= 0.5) return "oklch(0.64 0.11 110)"
    return "oklch(0.6 0.13 45)"
  }, [progress])

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
          {clampedValue}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">
          / {clampedMax}
        </span>
      </div>
    </div>
  )
}
