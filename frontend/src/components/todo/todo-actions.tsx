"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, PencilIcon, Trash2Icon, CheckIcon, ClockIcon, RotateCcwIcon } from "lucide-react"
import type { Todo, TodoStatus } from "@/types"
import { useUpdateTodo } from "@/hooks/use-todos"
import { toast } from "sonner"

interface TodoActionsProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export function TodoActions({ todo, onEdit, onDelete }: TodoActionsProps) {
  const updateTodo = useUpdateTodo()

  const handleStatusChange = (status: TodoStatus) => {
    updateTodo.mutate(
      { id: todo.id, data: { status } },
      { onError: () => toast.error("Failed to update status") }
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-xs" className="h-6 w-6" />
        }
      >
        <MoreHorizontal size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onEdit(todo)}>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        {todo.status !== "TODO" && (
          <DropdownMenuItem onClick={() => handleStatusChange("TODO")}>
            <RotateCcwIcon />
            Mark as Todo
          </DropdownMenuItem>
        )}
        {todo.status !== "IN_PROGRESS" && (
          <DropdownMenuItem onClick={() => handleStatusChange("IN_PROGRESS")}>
            <ClockIcon />
            Mark In Progress
          </DropdownMenuItem>
        )}
        {todo.status !== "DONE" && (
          <DropdownMenuItem onClick={() => handleStatusChange("DONE")}>
            <CheckIcon />
            Mark Complete
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(todo)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
