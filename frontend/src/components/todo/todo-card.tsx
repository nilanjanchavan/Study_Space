"use client"

import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { PriorityBadge } from "./priority-badge"
import { StatusBadge } from "./status-badge"
import { TodoActions } from "./todo-actions"
import { CheckCircle2, Circle, Clock, CalendarIcon } from "lucide-react"
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

  const isDone = todo.status === "DONE"
  const isInProgress = todo.status === "IN_PROGRESS"

  const handleStatusToggle = () => {
    const nextStatus = isDone ? "TODO" : "DONE"
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
        "group flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3 transition-all duration-150",
        "hover:border-border hover:bg-muted/30 hover:shadow-soft hover:-translate-y-px",
        "active:translate-y-0 active:shadow-pressed",
        isDone && "opacity-50 hover:opacity-70"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleStatusToggle}
        className={cn(
          "mt-0.5 shrink-0 transition-all duration-150 rounded-full",
          isDone
            ? "text-success hover:text-success/70"
            : isInProgress
              ? "text-blue-500 hover:text-blue-400"
              : "text-muted-foreground/40 hover:text-foreground/60"
        )}
        aria-label={isDone ? "Mark as todo" : "Mark as done"}
      >
        {isDone ? (
          <CheckCircle2 size={18} />
        ) : isInProgress ? (
          <Clock size={18} />
        ) : (
          <Circle size={18} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "text-sm font-medium text-foreground leading-snug min-w-0 break-words",
              isDone && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </h3>
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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
                "inline-flex items-center gap-1 text-[11px] tabular-nums",
                isOverdue ? "text-destructive font-medium" : "text-muted-foreground/60"
              )}
            >
              <CalendarIcon size={10} />
              {format(new Date(todo.dueDate), "MMM d")}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
