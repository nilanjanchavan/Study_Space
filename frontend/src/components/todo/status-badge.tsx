import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TodoStatus } from "@/types"

const statusConfig: Record<TodoStatus, { label: string; className: string }> = {
  TODO: { label: "Todo", className: "bg-muted/60 text-muted-foreground border-transparent" },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/10",
  },
  DONE: {
    label: "Done",
    className: "bg-success/10 text-success border-success/10",
  },
  CANCELED: {
    label: "Canceled",
    className: "bg-muted/40 text-muted-foreground/50 border-transparent line-through",
  },
}

interface StatusBadgeProps {
  status: TodoStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
