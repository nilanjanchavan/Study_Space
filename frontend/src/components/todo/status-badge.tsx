import { cn } from "@/lib/utils"
import type { TodoStatus } from "@/types"

const statusConfig: Record<TodoStatus, { label: string; className: string }> = {
  TODO: {
    label: "Todo",
    className:
      "bg-zinc-500/10 text-zinc-600 border-zinc-500/15 dark:text-zinc-400 dark:bg-zinc-400/10 dark:border-zinc-400/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-blue-500/10 text-blue-600 border-blue-500/15 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/20",
  },
  DONE: {
    label: "Done",
    className:
      "bg-success/10 text-success border-success/15 dark:bg-success/15 dark:border-success/25",
  },
  CANCELED: {
    label: "Canceled",
    className:
      "bg-zinc-500/10 text-zinc-500/70 border-zinc-500/10 line-through dark:bg-zinc-400/10 dark:text-zinc-400/60 dark:border-zinc-400/15",
  },
}

interface StatusBadgeProps {
  status: TodoStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
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
