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
import { PlusIcon, CheckSquareIcon } from "lucide-react"
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

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <SectionHeader
        title="Todos"
        subtitle={`${pagination?.total ?? 0} tasks`}
        accent={{
          icon: <CheckSquareIcon size={14} />,
          className: "bg-emerald-500/10 text-emerald-500",
        }}
        action={
          <Button size="lg" onClick={() => setFormOpen(true)} className="gap-2">
            New todo
            <PlusIcon size={14} />
          </Button>
        }
      />

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
            accent="bg-emerald-500/10 text-emerald-500"
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
