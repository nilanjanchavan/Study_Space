"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useTodos, useCreateTodo, useUpdateTodo } from "@/hooks/use-todos"
import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
import { ProgressBar } from "@/components/design-system/progress"
import { EmptyState } from "@/components/design-system/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, ListTodoIcon, CheckIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Todo, TodoPriority } from "@/types"

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-muted-foreground/40",
}

function TodoRow({ todo, onToggle }: { todo: Todo; onToggle: (id: string, currentStatus: string) => void }) {
  const isDone = todo.status === "DONE"
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150",
      "hover:bg-muted/40 group cursor-pointer",
      isDone && "opacity-50"
    )}>
      <button
        onClick={() => onToggle(todo.id, todo.status)}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          isDone ? "bg-success border-success text-white" : "border-border/60 group-hover:border-primary/40"
        )}
        aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
      >
        {isDone && <CheckIcon size={12} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium text-foreground truncate", isDone && "line-through text-muted-foreground")}>
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", PRIORITY_COLORS[todo.priority])} />
          <span className="text-[10px] text-muted-foreground capitalize">{todo.priority.toLowerCase()}</span>
          {todo.dueDate && (
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {format(new Date(todo.dueDate), "MMM d")}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function TodoRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
      <div className="h-5 w-5 rounded border border-border/40 shrink-0 animate-pulse-soft" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-3/4 rounded bg-muted/60 animate-pulse-soft" />
        <div className="h-3 w-16 rounded bg-muted/40 animate-pulse-soft" />
      </div>
    </div>
  )
}

export function TodaysTasks() {
  const [quickAddValue, setQuickAddValue] = useState("")
  const { data: todosData, isLoading } = useTodos({ limit: 5, sortBy: "createdAt", sortOrder: "desc" })
  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()

  const todos = todosData?.data.todos ?? []
  const completedCount = todos.filter((t) => t.status === "DONE").length

  const handleToggle = useCallback((id: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE"
    updateTodo.mutate({ id, data: { status: newStatus } })
  }, [updateTodo])

  const handleQuickAdd = useCallback(() => {
    const title = quickAddValue.trim()
    if (!title) return
    createTodo.mutate(
      { title, priority: "MEDIUM", status: "TODO" },
      {
        onSuccess: () => { setQuickAddValue(""); toast.success("Todo added") },
        onError: () => toast.error("Failed to add todo"),
      }
    )
  }, [quickAddValue, createTodo])

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Today's Tasks"
        subtitle={todos.length > 0 ? `${completedCount} of ${todos.length} done` : undefined}
        accent={{ icon: <ListTodoIcon size={14} />, className: "bg-indigo-500/10 text-indigo-500" }}
        action={
          <Link href="/todos">
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2">View all</Button>
          </Link>
        }
      />

      {todos.length > 0 && (
        <div className="mt-2 mb-3">
          <ProgressBar value={completedCount} max={todos.length} size="sm" gradient />
        </div>
      )}

      <div className="space-y-0.5">
        {isLoading ? (
          <>
            <TodoRowSkeleton /><TodoRowSkeleton /><TodoRowSkeleton />
          </>
        ) : todos.length === 0 ? (
          <EmptyState
            icon={<ListTodoIcon size={20} />}
            title="No tasks yet"
            description="Add your first task to track progress"
          />
        ) : (
          todos.map((todo) => (
            <TodoRow key={todo.id} todo={todo} onToggle={handleToggle} />
          ))
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Input
          value={quickAddValue}
          onChange={(e) => setQuickAddValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleQuickAdd() }}
          placeholder="Quick add..."
          className="h-8 text-sm"
          disabled={createTodo.isPending}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleQuickAdd}
          disabled={!quickAddValue.trim() || createTodo.isPending}
        >
          <PlusIcon size={14} />
        </Button>
      </div>
    </GlassCard>
  )
}
