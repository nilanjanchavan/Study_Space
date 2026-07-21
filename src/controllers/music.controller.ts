import { Request, Response } from 'express';
import { getPreferences, updatePreferences } from '../services/music.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

// ── GET /api/music/preferences ─────────────────────────────────────────────
export const get = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const preferences = await getPreferences(req.user.id);
  return sendSuccess(res, { preferences });
});

// ── PATCH /api/music/preferences ───────────────────────────────────────────
export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized('Authentication required', 'AUTH_TOKEN_MISSING');
  const preferences = await updatePreferences(req.user.id, req.body);
  return sendSuccess(res, { preferences });
});
