import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type InteractiveCardProps = HTMLAttributes<HTMLDivElement>

const InteractiveCard = forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-card text-card-foreground cursor-pointer",
        "border border-border/60 shadow-soft",
        "ring-1 ring-foreground/[0.03]",
        "dark:ring-white/[0.05]",
        "transition-all duration-200 ease-out",
        "hover:shadow-medium hover:ring-foreground/[0.06]",
        "dark:hover:ring-white/[0.08]",
        "hover:-translate-y-0.5",
        "active:translate-y-0 active:shadow-soft",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "select-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
InteractiveCard.displayName = "InteractiveCard"

export { InteractiveCard, type InteractiveCardProps }
