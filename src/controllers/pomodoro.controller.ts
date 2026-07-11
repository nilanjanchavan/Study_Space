import { Request, Response } from 'express';
import {
  startSession,
  pauseSession,
  resumeSession,
  completeSession,
  cancelSession,
  getCurrentSession,
  getHistory,
} from '../services/pomodoro.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import type { HistoryQuery } from '../validators/pomodoro.validators';

// ── POST /api/pomodoro/start ──────────────────────────────────────────────
export const start = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await startSession(req.user.id, req.body);
  return sendSuccess(res, { session }, 201);
});

// ── POST /api/pomodoro/pause ───────────────────────────────────────────────
export const pause = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await pauseSession(req.user.id);
  return sendSuccess(res, { session });
});

// ── POST /api/pomodoro/resume ──────────────────────────────────────────────
export const resume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await resumeSession(req.user.id);
  return sendSuccess(res, { session });
});

// ── POST /api/pomodoro/complete ────────────────────────────────────────────
export const complete = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await completeSession(req.user.id);
  return sendSuccess(res, { session });
});

// ── POST /api/pomodoro/cancel ──────────────────────────────────────────────
export const cancel = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await cancelSession(req.user.id);
  return sendSuccess(res, { session });
});

// ── GET /api/pomodoro/current ┐─────────────────────────────────────────────
export const current = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const session = await getCurrentSession(req.user.id);
  return sendSuccess(res, { session });
});

// ── GET /api/pomodoro/history ┐─────────────────────────────────────────────
export const history = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const result = await getHistory(req.user.id, req.validatedQuery as unknown as HistoryQuery);
  return sendSuccess(res, result);
});
