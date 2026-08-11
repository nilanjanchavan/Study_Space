import { forwardRef, type HTMLAttributes, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl"
}

const maxWidths = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
}

const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, maxWidth = "lg", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full",
        maxWidths[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
PageContainer.displayName = "PageContainer"

interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: ReactNode
  accent?: {
    icon?: ReactNode
    className?: string
  }
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, action, accent, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-4", className)}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-title font-heading text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-caption text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {accent?.icon && (
          <span
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
              "bg-primary/[0.08] text-primary ring-1 ring-black/[0.03] dark:ring-white/[0.06]",
              accent.className
            )}
          >
            {accent.icon}
          </span>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
)
SectionHeader.displayName = "SectionHeader"

export { PageContainer, SectionHeader, type PageContainerProps, type SectionHeaderProps }
