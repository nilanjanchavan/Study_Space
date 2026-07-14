import { Request, Response } from 'express';
import {
  startFocus,
  endFocus,
  cancelFocus,
  getCurrentFocus,
  getFocusById,
  getFocusHistory,
} from '../services/focus.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import type { HistoryFocusQuery } from '../validators/focus.validators';

// ── POST /api/focus/start ──────────────────────────────────────────────────
export const start = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await startFocus(req.user.id, req.body);
  return sendSuccess(res, { session }, 201);
});

// ── POST /api/focus/end ────────────────────────────────────────────────────
export const end = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await endFocus(req.user.id);
  return sendSuccess(res, { session });
});

// ── POST /api/focus/cancel ─────────────────────────────────────────────────
export const cancel = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await cancelFocus(req.user.id);
  return sendSuccess(res, { session });
});

// ── GET /api/focus/current ┐────────────────────────────────────────────────
export const current = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await getCurrentFocus(req.user.id);
  return sendSuccess(res, { session });
});

// ── GET /api/focus/:id ┐────────────────────────────────────────────────────
export const getById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await getFocusById(req.user.id, req.params.id as string);
  return sendSuccess(res, { session });
});

// ── GET /api/focus/history ┐────────────────────────────────────────────────
export const history = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const result = await getFocusHistory(
    req.user.id,
    req.validatedQuery as unknown as HistoryFocusQuery,
  );
  return sendSuccess(res, result);
});
