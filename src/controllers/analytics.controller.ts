import { Request, Response } from 'express';
import {
  getDashboard,
  getDaily,
  getWeekly,
  getMonthly,
  getStreak,
} from '../services/analytics.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import type { AnalyticsDateQuery } from '../validators/analytics.validators';

// ── GET /api/analytics/dashboard ───────────────────────────────────────────
export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const data = await getDashboard(req.user.id);
  return sendSuccess(res, data);
});

// ── GET /api/analytics/daily ───────────────────────────────────────────────
export const daily = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const q = req.validatedQuery as unknown as AnalyticsDateQuery;
  const data = await getDaily(req.user.id, q?.date);
  return sendSuccess(res, data);
});

// ── GET /api/analytics/weekly ──────────────────────────────────────────────
export const weekly = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const data = await getWeekly(req.user.id);
  return sendSuccess(res, data);
});

// ── GET /api/analytics/monthly ─────────────────────────────────────────────
export const monthly = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const q = req.validatedQuery as unknown as AnalyticsDateQuery;
  const data = await getMonthly(req.user.id, q?.date);
  return sendSuccess(res, data);
});

// ── GET /api/analytics/streak ──────────────────────────────────────────────
export const streak = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const data = await getStreak(req.user.id);
  return sendSuccess(res, data);
});
