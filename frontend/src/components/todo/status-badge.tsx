import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TodoStatus } from "@/types"

const statusConfig: Record<TodoStatus, { label: string; className: string }> = {
  TODO: { label: "Todo", className: "bg-muted text-muted-foreground border-transparent" },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-transparent",
  },
  DONE: {
    label: "Done",
    className: "bg-green-500/10 text-green-600 dark:text-green-400 border-transparent",
  },
  CANCELED: {
    label: "Canceled",
    className: "bg-muted text-muted-foreground/60 border-transparent line-through",
  },
}

interface StatusBadgeProps {
  status: TodoStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn("text-xs font-medium px-1.5 py-0", config.className, className)}>
      {config.label}
    </Badge>
  )
}
