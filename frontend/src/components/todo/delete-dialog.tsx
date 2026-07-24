"use client"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useDeleteTodo } from "@/hooks/use-todos"
import { toast } from "sonner"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todoId: string
  todoTitle: string
}

export function DeleteDialog({ open, onOpenChange, todoId, todoTitle }: DeleteDialogProps) {
  const deleteTodo = useDeleteTodo()

  const handleDelete = () => {
    deleteTodo.mutate(todoId, {
      onSuccess: () => {
        toast.success("Todo deleted")
        onOpenChange(false)
      },
      onError: () => toast.error("Failed to delete todo"),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete todo"
      description={`Are you sure you want to delete "${todoTitle}"? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={handleDelete}
      isLoading={deleteTodo.isPending}
    />
  )
}
