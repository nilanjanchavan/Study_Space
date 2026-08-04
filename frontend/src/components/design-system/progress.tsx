import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  accentColor?: boolean
  size?: "sm" | "default" | "lg"
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, accentColor = true, size = "default", ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))
    const heights = { sm: "h-1", default: "h-1.5", lg: "h-2.5" }
    return (
      <div
        ref={ref}
        className={cn("w-full overflow-hidden rounded-full bg-muted/40 dark:bg-white/[0.06]", heights[size], className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            accentColor ? "bg-primary" : "bg-foreground/60"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  size?: number
  strokeWidth?: number
  accentColor?: boolean
}

const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ className, value, size = 48, strokeWidth = 4, accentColor = true, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, value))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (pct / 100) * circumference
    return (
      <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)} {...props}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/40 dark:text-white/[0.06]"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              "transition-all duration-500 ease-out",
              accentColor ? "text-primary" : "text-foreground/60"
            )}
          />
        </svg>
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

export { ProgressBar, CircularProgress, type ProgressBarProps, type CircularProgressProps }
