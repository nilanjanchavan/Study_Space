import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import type { UpsertCodeforcesInput } from '../validators/codeforces.validators';

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

export type CodeforcesProfileItem = {
  id: string;
  codeforcesHandle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  contribution: number | null;
  avatar: string | null;
  titlePhoto: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Shape of the relevant fields returned by the CF user.info API. */
interface CfUserInfo {
  handle?: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  contribution?: number;
  avatar?: string;
  titlePhoto?: string;
}

const CF_API_BASE = 'https://codeforces.com/api/user.info';
const CF_TIMEOUT_MS = 8000;

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function serialize(p: {
  id: string;
  codeforcesHandle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  contribution: number | null;
  avatar: string | null;
  titlePhoto: string | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): CodeforcesProfileItem {
  return {
    id: p.id,
    codeforcesHandle: p.codeforcesHandle,
    rating: p.rating,
    maxRating: p.maxRating,
    rank: p.rank,
    maxRank: p.maxRank,
    contribution: p.contribution,
    avatar: p.avatar,
    titlePhoto: p.titlePhoto,
    lastSyncedAt: p.lastSyncedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// GET — cached profile (or null)
// ───────────────────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<CodeforcesProfileItem | null> {
  const profile = await prisma.codeforcesProfile.findUnique({ where: { userId } });
  return profile ? serialize(profile) : null;
}

// ───────────────────────────────────────────────────────────────────────────
// PUT — save/update handle (no sync)
// ───────────────────────────────────────────────────────────────────────────

export async function upsertProfile(
  userId: string,
  input: UpsertCodeforcesInput,
): Promise<CodeforcesProfileItem> {
  const { handle } = input;

  // Check handle uniqueness across users (handles are globally unique on CF).
  const conflict = await prisma.codeforcesProfile.findFirst({
    where: { codeforcesHandle: handle, NOT: { userId } },
    select: { userId: true },
  });
  if (conflict) {
    throw AppError.conflict('Codeforces handle is already linked to another account', 'HANDLE_TAKEN');
  }

  const profile = await prisma.codeforcesProfile.upsert({
    where: { userId },
    update: { codeforcesHandle: handle },
    create: { userId, codeforcesHandle: handle },
  });

  return serialize(profile);
}

// ───────────────────────────────────────────────────────────────────────────
// POST /sync — fetch from CF API + cache
// ───────────────────────────────────────────────────────────────────────────

export async function syncProfile(userId: string): Promise<CodeforcesProfileItem> {
  const existing = await prisma.codeforcesProfile.findUnique({ where: { userId } });
  if (!existing) {
    throw AppError.notFound(
      'No Codeforces handle saved; save a handle before syncing',
      'CF_PROFILE_NOT_FOUND',
    );
  }

  const info = await fetchCodeforcesUser(existing.codeforcesHandle);

  const updated = await prisma.codeforcesProfile.update({
    where: { userId },
    data: {
      rating: info.rating ?? null,
      maxRating: info.maxRating ?? null,
      rank: info.rank ?? null,
      maxRank: info.maxRank ?? null,
      contribution: info.contribution ?? null,
      avatar: info.avatar ?? null,
      titlePhoto: info.titlePhoto ?? null,
      lastSyncedAt: new Date(),
    },
  });

  return serialize(updated);
}

// ───────────────────────────────────────────────────────────────────────────
// DELETE — unlink profile
// ───────────────────────────────────────────────────────────────────────────

export async function deleteProfile(userId: string): Promise<void> {
  const existing = await prisma.codeforcesProfile.findUnique({ where: { userId } });
  if (!existing) {
    throw AppError.notFound('No Codeforces profile linked', 'CF_PROFILE_NOT_FOUND');
  }
  await prisma.codeforcesProfile.delete({ where: { userId } });
}

// ───────────────────────────────────────────────────────────────────────────
// CF API fetch with robust error handling
// ───────────────────────────────────────────────────────────────────────────

async function fetchCodeforcesUser(handle: string): Promise<CfUserInfo> {
  const url = `${CF_API_BASE}?handles=${encodeURIComponent(handle)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(CF_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    // Network error or timeout — do NOT crash.
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw AppError.badRequest(
        'Codeforces API request timed out; please try again later',
        'CF_API_TIMEOUT',
      );
    }
    throw AppError.badRequest(
      'Unable to reach Codeforces API; please try again later',
      'CF_API_UNAVAILABLE',
    );
  }

  if (!res.ok) {
    throw AppError.badRequest(
      `Codeforces API returned HTTP ${res.status}`,
      'CF_API_HTTP_ERROR',
    );
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw AppError.badRequest('Codeforces API returned malformed JSON', 'CF_API_MALFORMED');
  }

  // CF API envelope: { status: 'OK'|'FAILED', result: [...], comment?: '...' }
  const envelope = body as { status?: string; result?: CfUserInfo[]; comment?: string };
  if (envelope.status !== 'OK' || !Array.isArray(envelope.result) || envelope.result.length === 0) {
    const comment = envelope.comment ?? 'Codeforces API reported the handle was not found';
    throw AppError.badRequest(comment, 'CF_HANDLE_NOT_FOUND');
  }

  return envelope.result[0];
}
