import { cn } from "@/lib/utils"
import type { TodoPriority } from "@/types"

const priorityConfig: Record<TodoPriority, { label: string; className: string }> = {
  LOW: {
    label: "Low",
    className:
      "bg-zinc-500/10 text-zinc-600 border-zinc-500/15 dark:text-zinc-400 dark:bg-zinc-400/10 dark:border-zinc-400/20",
  },
  MEDIUM: {
    label: "Medium",
    className:
      "bg-blue-500/10 text-blue-600 border-blue-500/15 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20",
  },
  HIGH: {
    label: "High",
    className:
      "bg-orange-500/10 text-orange-600 border-orange-500/15 dark:text-orange-400 dark:bg-orange-400/10 dark:border-orange-400/20",
  },
  URGENT: {
    label: "Urgent",
    className:
      "bg-destructive/10 text-destructive border-destructive/15 dark:bg-destructive/15 dark:border-destructive/25",
  },
}

interface PriorityBadgeProps {
  priority: TodoPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
