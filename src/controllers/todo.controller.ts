import { Request, Response } from 'express';
import {
  createTodo,
  getTodoById,
  listTodos,
  updateTodo,
  deleteTodo,
} from '../services/todo.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import type { ListTodosQuery } from '../validators/todo.validators';

// ── POST /api/todos ───────────────────────────────────────────────────────
export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  }
  const todo = await createTodo(req.user.id, req.body);
  return sendSuccess(res, { todo }, 201);
});

// ── GET /api/todos ────────────────────────────────────────────────────────
export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  }
  // `req.validatedQuery` is populated by the validate('query') middleware.
  // Express 5's `req.query` is a read-only getter, so we use validatedQuery.
  const result = await listTodos(req.user.id, req.validatedQuery as unknown as ListTodosQuery);
  return sendSuccess(res, result);
});

// ── GET /api/todos/:id ──────────────────────────────────────────────────
export const getById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  }
  const todo = await getTodoById(req.user.id, req.params.id as string);
  return sendSuccess(res, { todo });
});

// ── PATCH /api/todos/:id ─────────────────────────────────────────────────
export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  }
  const todo = await updateTodo(req.user.id, req.params.id as string, req.body);
  return sendSuccess(res, { todo });
});

// ── DELETE /api/todos/:id ────────────────────────────────────────────────
export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  }
  await deleteTodo(req.user.id, req.params.id as string);
  return sendSuccess(res, { message: 'Todo deleted successfully' });
});
