import { type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse-soft rounded-lg bg-muted/60 dark:bg-white/[0.06]",
        className
      )}
      {...props}
    />
  )
}

function SkeletonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-border/40 bg-card p-4 space-y-3", className)}
      {...props}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
  )
}

function SkeletonChart({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const heights = [45, 72, 58, 85, 35, 68, 50]
  return (
    <div
      className={cn("rounded-xl border border-border/40 bg-card p-4 space-y-3", className)}
      {...props}
    >
      <Skeleton className="h-4 w-1/4" />
      <div className="flex items-end gap-2 h-32">
        {heights.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5, className, ...props }: HTMLAttributes<HTMLDivElement> & { rows?: number }) {
  return (
    <div
      className={cn("rounded-xl border border-border/40 bg-card overflow-hidden", className)}
      {...props}
    >
      <div className="border-b border-border/40 px-4 py-3">
        <Skeleton className="h-3 w-1/3" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border/20 px-4 py-3 last:border-b-0">
          <Skeleton className="h-4 w-4 rounded-full shrink-0" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-16 shrink-0" />
        </div>
      ))}
    </div>
  )
}

function Spinner({ className, size = 20, ...props }: HTMLAttributes<HTMLDivElement> & { size?: number }) {
  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin text-primary"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonChart, SkeletonTable, Spinner }
