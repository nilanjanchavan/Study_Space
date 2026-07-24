"use client"

import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { PriorityBadge } from "./priority-badge"
import { StatusBadge } from "./status-badge"
import { TodoActions } from "./todo-actions"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import type { Todo } from "@/types"
import { useUpdateTodo } from "@/hooks/use-todos"
import { toast } from "sonner"

interface TodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export function TodoCard({ todo, onEdit, onDelete }: TodoCardProps) {
  const updateTodo = useUpdateTodo()

  const isOverdue =
    todo.dueDate &&
    todo.status !== "DONE" &&
    todo.status !== "CANCELED" &&
    new Date(todo.dueDate) < new Date()

  const handleStatusToggle = () => {
    const nextStatus = todo.status === "DONE" ? "TODO" : "DONE"
    updateTodo.mutate(
      { id: todo.id, data: { status: nextStatus } },
      {
        onError: () => toast.error("Failed to update status"),
      }
    )
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30",
        todo.status === "DONE" && "opacity-60"
      )}
    >
      <button
        onClick={handleStatusToggle}
        className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={todo.status === "DONE" ? "Mark as todo" : "Mark as done"}
      >
        {todo.status === "DONE" ? (
          <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
        ) : todo.status === "IN_PROGRESS" ? (
          <Clock size={18} className="text-blue-500 dark:text-blue-400" />
        ) : (
          <Circle size={18} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "text-sm font-medium text-foreground leading-snug",
              todo.status === "DONE" && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </h3>
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <TodoActions todo={todo} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>

        {todo.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {todo.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <StatusBadge status={todo.status} />
          <PriorityBadge priority={todo.priority} />
          {todo.dueDate && (
            <span
              className={cn(
                "text-[11px] text-muted-foreground",
                isOverdue && "text-destructive font-medium"
              )}
            >
              {format(new Date(todo.dueDate), "MMM d, yyyy")}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
