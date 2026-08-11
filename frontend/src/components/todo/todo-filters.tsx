"use client"

import { cn } from "@/lib/utils"
import { FilterIcon } from "lucide-react"
import type { TodoListParams, TodoStatus, TodoPriority } from "@/types"

interface TodoFiltersProps {
  params: TodoListParams
  onChange: (params: TodoListParams) => void
}

const STATUS_OPTIONS: { value: TodoStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
  { value: "CANCELED", label: "Canceled" },
]

const PRIORITY_OPTIONS: { value: TodoPriority | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
]

const SORT_OPTIONS: { value: TodoListParams["sortBy"]; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
]

const ORDER_OPTIONS: { value: "asc" | "desc"; label: string }[] = [
  { value: "desc", label: "Newest" },
  { value: "asc", label: "Oldest" },
]

export function TodoFilters({ params, onChange }: TodoFiltersProps) {
  const chipBase =
    "rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150"
  const chipActive =
    "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/30"
  const chipIdle =
    "bg-card/50 text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-muted-foreground/60">
        <span className="text-xs font-medium">Filters</span>
        <FilterIcon size={13} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              onChange({
                ...params,
                status: opt.value === "all" ? undefined : (opt.value as TodoStatus),
                page: 1,
              })
            }
            className={cn(
              chipBase,
              (params.status ?? "all") === opt.value ? chipActive : chipIdle
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {PRIORITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              onChange({
                ...params,
                priority: opt.value === "all" ? undefined : (opt.value as TodoPriority),
                page: 1,
              })
            }
            className={cn(
              chipBase,
              (params.priority ?? "all") === opt.value ? chipActive : chipIdle
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="hairline-t my-1" />

      <div className="flex flex-wrap items-center gap-1.5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ ...params, sortBy: opt.value, page: 1 })}
            className={cn(
              chipBase,
              (params.sortBy ?? "createdAt") === opt.value ? chipActive : chipIdle
            )}
          >
            {opt.label}
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-border/60" />
        {ORDER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ ...params, sortOrder: opt.value, page: 1 })}
            className={cn(
              chipBase,
              (params.sortOrder ?? "desc") === opt.value ? chipActive : chipIdle
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
