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
        "rounded-xl bg-card text-card-foreground",
        "shadow-floating ring-1 ring-foreground/[0.04]",
        "dark:shadow-none dark:ring-white/[0.06]",
        "transition-all duration-250 ease-out",
        hover && [
          "hover:shadow-[0_8px_32px_oklch(0_0_0/0.12)]",
          "dark:hover:shadow-[0_8px_32px_oklch(0_0_0/0.4)]",
          "hover:ring-foreground/[0.08] dark:hover:ring-white/[0.1]",
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
