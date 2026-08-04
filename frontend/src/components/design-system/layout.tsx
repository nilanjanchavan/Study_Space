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
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-4", className)}
      {...props}
    >
      <div className="min-w-0">
        <h3 className="text-title font-heading text-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-caption text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
)
SectionHeader.displayName = "SectionHeader"

export { PageContainer, SectionHeader, type PageContainerProps, type SectionHeaderProps }
