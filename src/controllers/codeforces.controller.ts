import { Request, Response } from 'express';
import { getProfile, upsertProfile, syncProfile, deleteProfile } from '../services/codeforces.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

// ── GET /api/codeforces/profile ────────────────────────────────────────────
export const get = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const profile = await getProfile(req.user.id);
  return sendSuccess(res, { profile });
});

// ── PUT /api/codeforces/profile ────────────────────────────────────────────
export const upsert = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const profile = await upsertProfile(req.user.id, req.body);
  return sendSuccess(res, { profile });
});

// ── POST /api/codeforces/sync ──────────────────────────────────────────────
export const sync = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const profile = await syncProfile(req.user.id);
  return sendSuccess(res, { profile });
});

// ── DELETE /api/codeforces/profile ─────────────────────────────────────────
export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  await deleteProfile(req.user.id);
  return sendSuccess(res, { message: 'Codeforces profile removed' });
});
