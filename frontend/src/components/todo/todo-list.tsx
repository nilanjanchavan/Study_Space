"use client"

import { useState } from "react"
import { useTodos, useCreateTodo, useUpdateTodo } from "@/hooks/use-todos"
import { TodoCard } from "./todo-card"
import { TodoForm } from "./todo-form"
import { TodoFilters } from "./todo-filters"
import { DeleteDialog } from "./delete-dialog"
import { EmptyState } from "@/components/design-system/empty-state"
import { SectionHeader } from "@/components/design-system/layout"
import { GlassCard } from "@/components/design-system/glass-card"
import { Spinner } from "@/components/design-system/skeleton"
import { Button } from "@/components/ui/button"
import { PlusIcon, CheckSquareIcon, ListTodoIcon, ClockIcon, FlameIcon, CheckCircle2Icon } from "lucide-react"
import { toast } from "sonner"
import type { Todo, TodoListParams, CreateTodoRequest, UpdateTodoRequest } from "@/types"

export function TodoList() {
  const [params, setParams] = useState<TodoListParams>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>()
  const [deletingTodo, setDeletingTodo] = useState<Todo | undefined>()

  const { data, isLoading } = useTodos(params)
  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()

  const todos = data?.data.todos || []
  const pagination = data?.data.pagination

  const handleCreate = (raw: CreateTodoRequest | UpdateTodoRequest) => {
    createTodo.mutate(raw as CreateTodoRequest, {
      onSuccess: () => {
        toast.success("Todo created")
        setFormOpen(false)
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
        toast.error(msg || "Failed to create todo")
      },
    })
  }

  const handleEdit = (raw: CreateTodoRequest | UpdateTodoRequest) => {
    if (!editingTodo) return
    updateTodo.mutate(
      { id: editingTodo.id, data: raw as UpdateTodoRequest },
      {
        onSuccess: () => {
          toast.success("Todo updated")
          setFormOpen(false)
          setEditingTodo(undefined)
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
          toast.error(msg || "Failed to update todo")
        },
      }
    )
  }

  const openEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingTodo(undefined)
  }

  const totalTasks = pagination?.total ?? todos.length
  const todoTasks = todos.filter((t) => t.status === "TODO").length
  const inProgressTasks = todos.filter((t) => t.status === "IN_PROGRESS").length
  const doneTasks = todos.filter((t) => t.status === "DONE").length

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <SectionHeader
        title="Todos"
        subtitle={`${totalTasks} total tasks in your workspace`}
        accent={{
          icon: <CheckSquareIcon size={14} />,
          className: "bg-primary/10 text-primary",
        }}
        action={
          <Button size="lg" onClick={() => setFormOpen(true)} className="gap-2 h-10 px-5 rounded-xl font-medium shadow-sm">
            <PlusIcon size={15} className="shrink-0" />
            <span>New todo</span>
          </Button>
        }
      />

      {/* Quick Task Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-black/[0.04] bg-card/65 p-3.5 shadow-soft ring-1 ring-black/[0.03] backdrop-blur-md dark:border-white/[0.05] dark:bg-card/40 dark:ring-white/[0.04] flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ListTodoIcon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">Total</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{totalTasks}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.04] bg-card/65 p-3.5 shadow-soft ring-1 ring-black/[0.03] backdrop-blur-md dark:border-white/[0.05] dark:bg-card/40 dark:ring-white/[0.04] flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <ClockIcon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">To Do</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{todoTasks}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.04] bg-card/65 p-3.5 shadow-soft ring-1 ring-black/[0.03] backdrop-blur-md dark:border-white/[0.05] dark:bg-card/40 dark:ring-white/[0.04] flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <FlameIcon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">In Progress</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{inProgressTasks}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.04] bg-card/65 p-3.5 shadow-soft ring-1 ring-black/[0.03] backdrop-blur-md dark:border-white/[0.05] dark:bg-card/40 dark:ring-white/[0.04] flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">Completed</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{doneTasks}</p>
          </div>
        </div>
      </div>

      <GlassCard className="p-4">
        <TodoFilters params={params} onChange={setParams} />
      </GlassCard>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={24} />
        </div>
      ) : todos.length === 0 ? (
        <GlassCard className="p-4">
          <EmptyState
            icon={<CheckSquareIcon size={24} />}
            title="No todos yet"
            description="Create your first task to get started"
            accent="bg-primary/10 text-primary"
            action={{
              label: "Create todo",
              onClick: () => setFormOpen(true),
            }}
          />
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-1.5">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={openEdit}
              onDelete={setDeletingTodo}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground tabular-nums">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} todos)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setParams({ ...params, page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setParams({ ...params, page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <TodoForm
        open={formOpen}
        onOpenChange={closeForm}
        todo={editingTodo}
        onSubmit={editingTodo ? handleEdit : handleCreate}
        isLoading={createTodo.isPending || updateTodo.isPending}
      />

      {deletingTodo && (
        <DeleteDialog
          open={!!deletingTodo}
          onOpenChange={(open) => !open && setDeletingTodo(undefined)}
          todoId={deletingTodo.id}
          todoTitle={deletingTodo.title}
        />
      )}
    </div>
  )
}
