"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TodoListParams, TodoStatus, TodoPriority } from "@/types"

interface TodoFiltersProps {
  params: TodoListParams
  onChange: (params: TodoListParams) => void
}

export function TodoFilters({ params, onChange }: TodoFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={params.status || "all"}
        onValueChange={(v) =>
          onChange({ ...params, status: v === "all" ? undefined : (v as TodoStatus), page: 1 })
        }
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="TODO">Todo</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
          <SelectItem value="CANCELED">Canceled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={params.priority || "all"}
        onValueChange={(v) =>
          onChange({ ...params, priority: v === "all" ? undefined : (v as TodoPriority), page: 1 })
        }
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="All priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="URGENT">Urgent</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={params.sortBy || "createdAt"}
        onValueChange={(v) =>
          onChange({
            ...params,
            sortBy: v as TodoListParams["sortBy"],
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created date</SelectItem>
          <SelectItem value="dueDate">Due date</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={params.sortOrder || "desc"}
        onValueChange={(v) =>
          onChange({
            ...params,
            sortOrder: v as "asc" | "desc",
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-[100px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Newest</SelectItem>
          <SelectItem value="asc">Oldest</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
