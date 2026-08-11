import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type InteractiveCardProps = HTMLAttributes<HTMLDivElement>

const InteractiveCard = forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative rounded-2xl bg-card text-card-foreground cursor-pointer",
        "border border-black/[0.05] shadow-soft",
        "ring-1 ring-black/[0.03]",
        "dark:border-white/[0.06] dark:ring-white/[0.05]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300",
        "before:bg-[radial-gradient(20rem_10rem_at_var(--gx,50%)_0%,oklch(0.645_0.1_150/0.08),transparent_60%)]",
        "before:dark:bg-[radial-gradient(20rem_10rem_at_var(--gx,50%)_0%,oklch(0.63_0.105_110/0.14),transparent_60%)]",
        "transition-all duration-300 ease-out",
        "hover:shadow-medium hover:ring-black/[0.06] dark:hover:ring-white/[0.09]",
        "hover:-translate-y-1",
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
