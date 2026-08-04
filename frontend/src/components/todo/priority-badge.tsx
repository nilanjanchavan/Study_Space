import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TodoPriority } from "@/types"

const priorityConfig: Record<TodoPriority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-muted/60 text-muted-foreground border-transparent" },
  MEDIUM: { label: "Medium", className: "bg-muted/60 text-muted-foreground border-transparent" },
  HIGH: {
    label: "High",
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/10",
  },
  URGENT: {
    label: "Urgent",
    className: "bg-destructive/10 text-destructive border-destructive/10",
  },
}

interface PriorityBadgeProps {
  priority: TodoPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
