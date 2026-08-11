import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  tone?: "default" | "indigo" | "violet" | "emerald" | "amber" | "rose" | "cyan"
}

const tones: Record<NonNullable<GlassCardProps["tone"]>, string> = {
  default: "",
  indigo: "before:via-indigo-400/30",
  violet: "before:via-violet-400/30",
  emerald: "before:via-emerald-400/30",
  amber: "before:via-amber-400/30",
  rose: "before:via-rose-400/30",
  cyan: "before:via-cyan-400/30",
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, tone = "default", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl border border-black/[0.05] bg-white/[0.66] backdrop-blur-xl",
        "shadow-soft ring-1 ring-black/[0.03]",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent",
        "dark:bg-white/[0.04] dark:border-white/[0.06] dark:ring-white/[0.04] dark:before:via-white/10",
        tones[tone],
        "transition-all duration-200 ease-out",
        hover && [
          "hover:shadow-medium hover:ring-black/[0.06]",
          "dark:hover:ring-white/[0.08]",
          "hover:-translate-y-0.5",
        ],
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
