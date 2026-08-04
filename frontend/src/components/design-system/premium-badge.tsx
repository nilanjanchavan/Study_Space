import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const BadgeWork = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-orange-500/10 text-orange-600 border border-orange-500/15",
        "dark:text-orange-400 dark:bg-orange-400/10 dark:border-orange-400/20",
        className
      )}
      {...props}
    />
  )
)
BadgeWork.displayName = "BadgeWork"

const BadgeBreak = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-emerald-500/10 text-emerald-600 border border-emerald-500/15",
        "dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20",
        className
      )}
      {...props}
    />
  )
)
BadgeBreak.displayName = "BadgeBreak"

const BadgeCompleted = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-green-500/10 text-green-600 border border-green-500/15",
        "dark:text-green-400 dark:bg-green-400/10 dark:border-green-400/20",
        className
      )}
      {...props}
    />
  )
)
BadgeCompleted.displayName = "BadgeCompleted"

const BadgePaused = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-amber-500/10 text-amber-600 border border-amber-500/15",
        "dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20",
        className
      )}
      {...props}
    />
  )
)
BadgePaused.displayName = "BadgePaused"

const BadgeRunning = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-blue-500/10 text-blue-600 border border-blue-500/15",
        "dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20",
        className
      )}
      {...props}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
      </span>
      {props.children}
    </span>
  )
)
BadgeRunning.displayName = "BadgeRunning"

const BadgeDanger = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-destructive/10 text-destructive border border-destructive/15",
        "dark:bg-destructive/15 dark:border-destructive/25",
        className
      )}
      {...props}
    />
  )
)
BadgeDanger.displayName = "BadgeDanger"

const BadgeSuccess = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-success/10 text-success border border-success/15",
        "dark:bg-success/15 dark:border-success/25",
        className
      )}
      {...props}
    />
  )
)
BadgeSuccess.displayName = "BadgeSuccess"

export { BadgeWork, BadgeBreak, BadgeCompleted, BadgePaused, BadgeRunning, BadgeDanger, BadgeSuccess }
