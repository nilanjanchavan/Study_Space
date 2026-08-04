"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTodos, useCreateTodo } from "@/hooks/use-todos"
import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
import { EmptyState } from "@/components/design-system/empty-state"
import { Skeleton } from "@/components/design-system/skeleton"
import { PriorityBadge } from "@/components/todo/priority-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, ListTodoIcon } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { TodoPriority } from "@/types"

function TodoRow({ todo }: { todo: { id: string; title: string; status: string; priority: TodoPriority; dueDate: string | null } }) {
  const isDone = todo.status === "DONE"
  return (
    <Link href="/todos">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150",
          "hover:bg-muted/40 hover:shadow-soft cursor-pointer group",
          isDone && "opacity-50"
        )}
      >
        <div
          className={cn(
            "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors",
            isDone
              ? "bg-success border-success text-white"
              : "border-border/60 group-hover:border-primary/40"
          )}
        >
          {isDone && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium text-foreground truncate transition-colors",
              isDone && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <PriorityBadge priority={todo.priority} />
            {todo.dueDate && (
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {format(new Date(todo.dueDate), "MMM d")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function TodoRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
      <Skeleton className="h-4.5 w-4.5 rounded shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function TodosPanel() {
  const router = useRouter()
  const [quickAddValue, setQuickAddValue] = useState("")
  const { data: todosData, isLoading } = useTodos({ limit: 5, sortBy: "createdAt", sortOrder: "desc" })
  const createTodo = useCreateTodo()

  const todos = todosData?.data.todos ?? []
  const completedCount = todos.filter((t) => t.status === "DONE").length

  const handleQuickAdd = useCallback(() => {
    const title = quickAddValue.trim()
    if (!title) return
    createTodo.mutate(
      { title, priority: "MEDIUM", status: "TODO" },
      {
        onSuccess: () => {
          setQuickAddValue("")
          toast.success("Todo added")
        },
        onError: () => toast.error("Failed to add todo"),
      }
    )
  }, [quickAddValue, createTodo])

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Today's Todos"
        subtitle={todos.length > 0 ? `${completedCount} / ${todos.length} completed` : undefined}
        action={
          <Link href="/todos">
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
              View all
            </Button>
          </Link>
        }
      />

      <div className="mt-3 space-y-0.5">
        {isLoading ? (
          <>
            <TodoRowSkeleton />
            <TodoRowSkeleton />
            <TodoRowSkeleton />
          </>
        ) : todos.length === 0 ? (
          <EmptyState
            icon={<ListTodoIcon size={20} />}
            title="No todos yet"
            description="Create your first todo to get started"
            action={{
              label: "Create todo",
              onClick: () => router.push("/todos"),
            }}
          />
        ) : (
          todos.map((todo) => <TodoRow key={todo.id} todo={todo} />)
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Input
          value={quickAddValue}
          onChange={(e) => setQuickAddValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAdd()
          }}
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
