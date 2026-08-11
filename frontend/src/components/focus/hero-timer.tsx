"use client"

import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface HeroTimerProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  strokeWidth?: number
  value: number
  timeDisplay: string
  isRunning: boolean
  accentColor?: boolean
}

const HeroTimer = forwardRef<HTMLDivElement, HeroTimerProps>(
  ({ className, size = 320, strokeWidth = 8, value, timeDisplay, isRunning, accentColor = true, ...props }, ref) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    return (
      <div ref={ref} className={cn("relative inline-flex items-center justify-center max-w-full", className)} {...props}>
        {/* Glow effect when running */}
        {isRunning && (
          <div
            className="absolute inset-0 rounded-full animate-pulse-soft bg-violet-500/10"
            style={{ filter: "blur(40px)" }}
          />
        )}

        {/* SVG Ring */}
        <div className="relative w-full max-w-[320px] aspect-square">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${size} ${size}`}
            className="block -rotate-90"
          >
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-border/30"
            />
            {/* Progress arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={accentColor ? "url(#heroTimerGradient)" : "currentColor"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn(
                "transition-all duration-1000 ease-linear",
                accentColor ? "text-violet-500" : "text-muted-foreground/30"
              )}
            />
            <defs>
              <linearGradient id="heroTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.72 0.115 45)" />
                <stop offset="100%" stopColor="oklch(0.63 0.125 45)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time display centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <span
              className="font-mono font-bold tracking-tighter text-foreground leading-none numeric"
              style={{ fontSize: `clamp(1.5rem, ${size * 0.2}px, 4rem)` }}
            >
              {timeDisplay}
            </span>
          </div>
        </div>
      </div>
    )
  }
)
HeroTimer.displayName = "HeroTimer"

export { HeroTimer }
