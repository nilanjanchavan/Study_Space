import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type SoftCardProps = HTMLAttributes<HTMLDivElement>

const SoftCard = forwardRef<HTMLDivElement, SoftCardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl bg-muted/45 p-4",
        "border border-black/[0.04]",
        "shadow-[inset_0_1px_0_oklch(1_0_0/0.6)]",
        "transition-all duration-200 ease-out",
        "dark:bg-white/[0.03] dark:border-white/[0.05] dark:shadow-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SoftCard.displayName = "SoftCard"

export { SoftCard, type SoftCardProps }
