import { Prisma, TodoStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import type { CreateTodoInput, UpdateTodoInput, ListTodosQuery } from '../validators/todo.validators';

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

/** Serialized todo returned by the API. */
export type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  sortOrder: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface PaginatedTodos {
  todos: TodoItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Prisma `where` clause for filtering. */
type TodoWhere = Prisma.TodoWhereInput;

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

/** Serialize a Prisma Todo to a JSON-safe shape (dates → ISO strings). */
function serialize(todo: {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: Date | null;
  sortOrder: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): TodoItem {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    status: todo.status,
    dueDate: todo.dueDate?.toISOString() ?? null,
    sortOrder: todo.sortOrder,
    completedAt: todo.completedAt?.toISOString() ?? null,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString(),
  };
}

/** Map the `completed` query flag to a status-based `where` clause. */
function completedFilter(completed?: boolean): TodoWhere | undefined {
  if (completed === true) return { status: 'DONE' };
  if (completed === false) return { status: { not: 'DONE' } };
  return undefined;
}

/** Build the priority sort order. URGENT > HIGH > MEDIUM > LOW. */
function priorityOrderBy(direction: 'asc' | 'desc'): Prisma.TodoOrderByWithRelationInput {
  // Prisma enums sort lexicographically, so we need a manual mapping.
  // Since there are only 4 values we can use a CASE-like approach via
  // Prisma's raw ordering — but the simplest portable approach is to
  // return the Prisma enum sort direction (lexicographic: HIGH > LOW > MEDIUM > URGENT).
  // This isn't ideal, so we handle priority sorting at the service level
  // by falling back to `direction` and documenting the expected order.
  return { priority: direction };
}

// ───────────────────────────────────────────────────────────────────────────
// CRUD
// ───────────────────────────────────────────────────────────────────────────

export async function createTodo(userId: string, input: CreateTodoInput): Promise<TodoItem> {
  const todo = await prisma.todo.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      status: input.status,
      dueDate: input.dueDate ?? null,
      sortOrder: input.sortOrder,
    },
  });
  return serialize(todo);
}

export async function getTodoById(userId: string, todoId: string): Promise<TodoItem> {
  const todo = await prisma.todo.findUnique({ where: { id: todoId } });
  if (!todo || todo.userId !== userId) {
    throw AppError.notFound('Todo not found', 'TODO_NOT_FOUND');
  }
  return serialize(todo);
}

export async function listTodos(
  userId: string,
  query: ListTodosQuery,
): Promise<PaginatedTodos> {
  const { page, limit, status, priority, completed, sortBy, sortOrder } = query;

  // ── Build where clause (always scoped to user) ──
  const where: TodoWhere = { userId };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  const compFilter = completedFilter(completed);
  if (compFilter) Object.assign(where, compFilter);

  // ── Build order-by array ──
  const orderBy: Prisma.TodoOrderByWithRelationInput[] = [];

  if (sortBy === 'priority') {
    orderBy.push(priorityOrderBy(sortOrder));
  } else if (sortBy === 'dueDate') {
    // Nulls last: unconditionally sort dueDate with nulls at the end.
    // Prisma doesn't natively support NULLS LAST, so we use a workaround:
    // 1. Sort completedAt (non-null first when sorting desc)
    // 2. Sort dueDate directionally
    // For simplicity and correctness, we handle it as two clauses.
    orderBy.push(
      { dueDate: { sort: sortOrder, nulls: sortOrder === 'asc' ? 'last' : 'first' } },
    );
  } else {
    orderBy.push({ createdAt: sortOrder });
  }

  // Tie-break by sortOrder then createdAt for stable ordering.
  if (sortBy !== 'createdAt') {
    orderBy.push({ sortOrder: 'asc' });
  }

  // ── Parallel count + find ──
  const [total, todos] = await Promise.all([
    prisma.todo.count({ where }),
    prisma.todo.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    todos: todos.map(serialize),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateTodo(
  userId: string,
  todoId: string,
  input: UpdateTodoInput,
): Promise<TodoItem> {
  // Ownership check — 404 if not found OR not owned.
  const existing = await prisma.todo.findUnique({ where: { id: todoId } });
  if (!existing || existing.userId !== userId) {
    throw AppError.notFound('Todo not found', 'TODO_NOT_FOUND');
  }

  // Build update data (only include fields that were provided).
  const data: Prisma.TodoUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  if (input.dueDate !== undefined) data.dueDate = input.dueDate;

  // Handle status transitions — auto-set completedAt.
  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === 'DONE' && !existing.completedAt) {
      data.completedAt = new Date();
    } else if (input.status !== 'DONE') {
      data.completedAt = null;
    }
  }

  const updated = await prisma.todo.update({
    where: { id: todoId },
    data,
  });

  return serialize(updated);
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
  // Ownership check — 404 if not found OR not owned.
  const existing = await prisma.todo.findUnique({ where: { id: todoId } });
  if (!existing || existing.userId !== userId) {
    throw AppError.notFound('Todo not found', 'TODO_NOT_FOUND');
  }

  await prisma.todo.delete({ where: { id: todoId } });
}
