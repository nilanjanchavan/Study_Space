import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

function TextDisplay({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("text-display font-heading text-foreground", className)} {...props} />
}

function TextHeading({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-heading font-heading text-foreground", className)} {...props} />
}

function TextTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-title font-heading text-foreground", className)} {...props} />
}

function TextSubtitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-subtitle text-foreground", className)} {...props} />
}

function TextBody({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-body text-foreground", className)} {...props} />
}

function TextCaption({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-caption text-muted-foreground", className)} {...props} />
}

function TextMuted({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-muted-size text-muted-foreground", className)} {...props} />
}

export { TextDisplay, TextHeading, TextTitle, TextSubtitle, TextBody, TextCaption, TextMuted }
