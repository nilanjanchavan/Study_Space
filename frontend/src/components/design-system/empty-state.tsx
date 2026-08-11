import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  title: string
  description?: string
  accent?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, accent = "bg-primary/[0.08] text-primary", action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center py-10 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl",
            accent,
            "shadow-[inset_0_1px_0_oklch(1_0_0/0.5)] ring-1 ring-black/[0.03] dark:ring-white/[0.06]"
          )}
        >
          {icon}
        </div>
      )}
      <h4 className="text-title text-foreground">{title}</h4>
      {description && (
        <p className="mt-1.5 max-w-sm text-body text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-5">
          {action.label}
        </Button>
      )}
    </div>
  )
)
EmptyState.displayName = "EmptyState"

export { EmptyState, type EmptyStateProps }
