import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface FloatingCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const FloatingCard = forwardRef<HTMLDivElement, FloatingCardProps>(
  ({ className, hover = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl bg-card text-card-foreground",
        "shadow-card ring-1 ring-black/[0.04]",
        "dark:shadow-none dark:ring-white/[0.06]",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl before:bg-gradient-to-r before:from-transparent before:via-black/[0.04] before:to-transparent dark:before:via-white/10",
        "transition-all duration-300 ease-out",
        hover && [
          "hover:shadow-floating",
          "dark:hover:shadow-[0_16px_44px_-16px_oklch(0_0_0/0.65)]",
          "hover:ring-black/[0.08] dark:hover:ring-white/[0.1]",
          "hover:-translate-y-1",
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
FloatingCard.displayName = "FloatingCard"

export { FloatingCard, type FloatingCardProps }
