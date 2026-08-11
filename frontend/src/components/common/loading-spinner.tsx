import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: number
}

export function LoadingSpinner({ className, size = 20 }: LoadingSpinnerProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-primary/15 border-t-primary shadow-[0_0_14px_-2px_oklch(0.645_0.1_150/0.35)]",
        className
      )}
      style={{ width: size, height: size }}
    />
  )
}
