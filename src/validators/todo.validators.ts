import { z } from 'zod';

// ───────────────────────────────────────────────────────────────────────────
// Enums match the Prisma schema values exactly.
// ───────────────────────────────────────────────────────────────────────────

const TodoPriority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
const TodoStatus = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELED']);

// ───────────────────────────────────────────────────────────────────────────
// Create
// ───────────────────────────────────────────────────────────────────────────

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().trim().max(5000, 'Description too long').optional(),
  priority: TodoPriority.default('MEDIUM'),
  status: TodoStatus.default('TODO'),
  dueDate: z.coerce.date().min(new Date(), 'Due date cannot be in the past').optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

// ───────────────────────────────────────────────────────────────────────────
// Update (all fields optional — only provided fields are changed)
// ───────────────────────────────────────────────────────────────────────────

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(500, 'Title too long').optional(),
  description: z
    .union([z.string().trim().max(5000, 'Description too long'), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? null : v ?? undefined)),
  priority: TodoPriority.optional(),
  status: TodoStatus.optional(),
  dueDate: z
    .union([z.coerce.date(), z.literal('null')])
    .optional()
    .transform((v) => (v === 'null' || v === null ? null : v)),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

// ───────────────────────────────────────────────────────────────────────────
// List query parameters
// ───────────────────────────────────────────────────────────────────────────

export const listTodosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: TodoStatus.optional(),
  priority: TodoPriority.optional(),
  completed: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  sortBy: z.enum(['dueDate', 'createdAt', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>;

// ───────────────────────────────────────────────────────────────────────────
// Params (UUID id)
// ───────────────────────────────────────────────────────────────────────────

export const todoIdParamSchema = z.object({
  id: z.string().uuid('Invalid todo ID format'),
});
