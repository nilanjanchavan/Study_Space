"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2Icon } from "lucide-react"
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoPriority, TodoStatus } from "@/types"
import { useEffect } from "react"

const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELED"]),
  dueDate: z.string().optional().or(z.literal("")),
})

type TodoFormValues = z.infer<typeof todoSchema>

interface TodoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo?: Todo
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => void
  isLoading?: boolean
}

export function TodoForm({ open, onOpenChange, todo, onSubmit, isLoading }: TodoFormProps) {
  const isEditing = !!todo

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: "",
    },
  })

  const priorityValue = useWatch({ control, name: "priority" })
  const statusValue = useWatch({ control, name: "status" })

  useEffect(() => {
    if (open) {
      if (todo) {
        reset({
          title: todo.title,
          description: todo.description || "",
          priority: todo.priority,
          status: todo.status,
          dueDate: todo.dueDate ? todo.dueDate.split("T")[0] : "",
        })
      } else {
        reset({
          title: "",
          description: "",
          priority: "MEDIUM",
          status: "TODO",
          dueDate: "",
        })
      }
    }
  }, [open, todo, reset])

  const handleFormSubmit = (data: TodoFormValues) => {
    const payload: CreateTodoRequest | UpdateTodoRequest = {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority as TodoPriority,
      status: data.status as TodoStatus,
      dueDate: data.dueDate || undefined,
    }
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit todo" : "New todo"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the todo details below." : "Add a new task to your list."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What needs to be done?" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional details..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Priority</Label>
              <Select
                value={priorityValue}
                onValueChange={(v) => setValue("priority", v as TodoPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={statusValue}
                onValueChange={(v) => setValue("status", v as TodoStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading && <Loader2Icon className="animate-spin" />}
              {isEditing ? "Save changes" : "Create todo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
