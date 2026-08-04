import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type SoftCardProps = HTMLAttributes<HTMLDivElement>

const SoftCard = forwardRef<HTMLDivElement, SoftCardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-muted/50 p-4",
        "border border-transparent",
        "transition-all duration-200 ease-out",
        "dark:bg-white/[0.03]",
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
