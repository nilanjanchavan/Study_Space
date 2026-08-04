import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.65] backdrop-blur-xl",
        "shadow-soft ring-1 ring-black/[0.03]",
        "dark:bg-white/[0.04] dark:border-white/[0.06] dark:ring-white/[0.04]",
        "transition-all duration-200 ease-out",
        hover && "hover:shadow-medium hover:ring-black/[0.06] dark:hover:ring-white/[0.08] hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
GlassCard.displayName = "GlassCard"

export { GlassCard, type GlassCardProps }
