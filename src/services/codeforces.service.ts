import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import type { UpsertCodeforcesInput } from '../validators/codeforces.validators';

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

export type CodeforcesStats = {
  totalSolved: number;
  solvedToday: number;
  streak: {
    current: number;
    longest: number;
  };
  calendar: Record<string, number>;
  ratingHistory: Array<{
    contestId: number;
    contestName: string;
    rank: number;
    oldRating: number;
    newRating: number;
    ratingUpdateTimeSeconds: number;
  }>;
  ratingDistribution: Array<{ bracket: string; count: number }>;
  topicTags: Array<{ tag: string; count: number }>;
  recentSolved: Array<{
    id: string;
    name: string;
    contestId: number;
    index: string;
    rating: number | null;
    tags: string[];
    solvedAt: number;
  }>;
  upcomingContests: Array<{
    id: number;
    name: string;
    durationSeconds: number;
    startTimeSeconds: number;
  }>;
};

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
  stats: CodeforcesStats | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

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

interface CfSubmission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  verdict?: string;
  problem: {
    contestId?: number;
    index?: string;
    name: string;
    rating?: number;
    tags?: string[];
  };
}

interface CfRatingChange {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

interface CfContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds: number;
  relativeTimeSeconds: number;
}

const CF_TIMEOUT_MS = 10000;

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function getLocalDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
  statsJson?: unknown;
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
    stats: (p.statsJson as CodeforcesStats) ?? null,
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
// PUT — save/update handle + sync immediately
// ───────────────────────────────────────────────────────────────────────────

export async function upsertProfile(
  userId: string,
  input: UpsertCodeforcesInput,
): Promise<CodeforcesProfileItem> {
  const { handle } = input;

  // If the handle was previously bound to another account, release it so the user can claim it
  await prisma.codeforcesProfile.deleteMany({
    where: { codeforcesHandle: { equals: handle, mode: 'insensitive' }, NOT: { userId } },
  });

  await prisma.codeforcesProfile.upsert({
    where: { userId },
    update: { codeforcesHandle: handle },
    create: { userId, codeforcesHandle: handle },
  });

  // Automatically attempt full sync
  try {
    return await syncProfile(userId);
  } catch {
    const saved = await prisma.codeforcesProfile.findUniqueOrThrow({ where: { userId } });
    return serialize(saved);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// POST /sync — fetch from CF API + cache all stats
// ───────────────────────────────────────────────────────────────────────────

export async function syncProfile(userId: string): Promise<CodeforcesProfileItem> {
  const existing = await prisma.codeforcesProfile.findUnique({ where: { userId } });
  if (!existing) {
    throw AppError.notFound(
      'No Codeforces handle saved; save a handle before syncing',
      'CF_PROFILE_NOT_FOUND',
    );
  }

  const handle = existing.codeforcesHandle;

  // Run all fetches in parallel
  const [userInfoResult, submissionsResult, ratingResult, contestResult] = await Promise.allSettled([
    fetchCodeforcesUser(handle),
    fetchCodeforcesSubmissions(handle),
    fetchCodeforcesRatingHistory(handle),
    fetchCodeforcesUpcomingContests(),
  ]);

  if (userInfoResult.status === 'rejected') {
    throw userInfoResult.reason;
  }

  const info = userInfoResult.value;
  const submissions = submissionsResult.status === 'fulfilled' ? submissionsResult.value : [];
  const ratingHistory = ratingResult.status === 'fulfilled' ? ratingResult.value : [];
  const upcomingContests = contestResult.status === 'fulfilled' ? contestResult.value : [];

  const stats = computeStats(submissions, ratingHistory, upcomingContests);

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
      statsJson: stats as object,
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
// Stats computation
// ───────────────────────────────────────────────────────────────────────────

function computeStats(
  submissions: CfSubmission[],
  ratingHistory: CfRatingChange[],
  upcomingContests: CfContest[],
): CodeforcesStats {
  const solvedMap = new Map<string, CfSubmission>();

  for (const sub of submissions) {
    if (sub.verdict === 'OK' && sub.problem?.contestId && sub.problem?.index) {
      const key = `${sub.problem.contestId}-${sub.problem.index}`;
      const existing = solvedMap.get(key);
      if (!existing || sub.creationTimeSeconds < existing.creationTimeSeconds) {
        solvedMap.set(key, sub);
      }
    }
  }

  const calendar: Record<string, number> = {};
  for (const sub of solvedMap.values()) {
    const dStr = getLocalDateStr(new Date(sub.creationTimeSeconds * 1000));
    calendar[dStr] = (calendar[dStr] || 0) + 1;
  }

  const todayStr = getLocalDateStr(new Date());
  const solvedToday = calendar[todayStr] || 0;

  // Streak calculation
  let currentStreak = 0;
  const checkDate = new Date();
  let checkStr = getLocalDateStr(checkDate);
  if ((calendar[checkStr] || 0) === 0) {
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    checkStr = getLocalDateStr(checkDate);
  }
  while ((calendar[checkStr] || 0) > 0) {
    currentStreak++;
    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    checkStr = getLocalDateStr(checkDate);
  }

  // Longest streak
  const sortedDates = Object.keys(calendar).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;
  for (const dStr of sortedDates) {
    const curDate = new Date(dStr + 'T00:00:00Z');
    if (prevDate) {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    prevDate = curDate;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // Rating bracket distribution
  const brackets = [
    { label: '800-1000', min: 800, max: 1000 },
    { label: '1100-1200', min: 1100, max: 1200 },
    { label: '1300-1400', min: 1300, max: 1400 },
    { label: '1500-1600', min: 1500, max: 1600 },
    { label: '1700-1800', min: 1700, max: 1800 },
    { label: '1900-2000', min: 1900, max: 2000 },
    { label: '2100+', min: 2100, max: 9999 },
  ];
  const ratingDistribution = brackets.map((b) => ({ bracket: b.label, count: 0 }));
  let unratedCount = 0;
  const tagCounts: Record<string, number> = {};

  for (const sub of solvedMap.values()) {
    const r = sub.problem.rating;
    if (typeof r === 'number') {
      const found = brackets.find((b) => r >= b.min && r <= b.max);
      if (found) {
        const item = ratingDistribution.find((d) => d.bracket === found.label);
        if (item) item.count++;
      }
    } else {
      unratedCount++;
    }
    if (Array.isArray(sub.problem.tags)) {
      for (const t of sub.problem.tags) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
    }
  }
  if (unratedCount > 0) {
    ratingDistribution.push({ bracket: 'Unrated', count: unratedCount });
  }

  const topicTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([tag, count]) => ({ tag, count }));

  // Recent solved problems
  const recentSolved = Array.from(solvedMap.values())
    .sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds)
    .slice(0, 15)
    .map((sub) => ({
      id: `${sub.problem.contestId}-${sub.problem.index}`,
      name: sub.problem.name,
      contestId: sub.problem.contestId!,
      index: sub.problem.index!,
      rating: sub.problem.rating ?? null,
      tags: sub.problem.tags || [],
      solvedAt: sub.creationTimeSeconds * 1000,
    }));

  return {
    totalSolved: solvedMap.size,
    solvedToday,
    streak: {
      current: currentStreak,
      longest: longestStreak,
    },
    calendar,
    ratingHistory: ratingHistory.map((rh) => ({
      contestId: rh.contestId,
      contestName: rh.contestName,
      rank: rh.rank,
      oldRating: rh.oldRating,
      newRating: rh.newRating,
      ratingUpdateTimeSeconds: rh.ratingUpdateTimeSeconds,
    })),
    ratingDistribution,
    topicTags,
    recentSolved,
    upcomingContests: upcomingContests.map((c) => ({
      id: c.id,
      name: c.name,
      durationSeconds: c.durationSeconds,
      startTimeSeconds: c.startTimeSeconds,
    })),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// CF API fetchers with robust error handling
// ───────────────────────────────────────────────────────────────────────────

async function fetchCodeforcesUser(handle: string): Promise<CfUserInfo> {
  const url = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`;
  const envelope = await cfFetch<{ status: string; result?: CfUserInfo[]; comment?: string }>(url);
  if (envelope.status !== 'OK' || !Array.isArray(envelope.result) || envelope.result.length === 0) {
    throw AppError.badRequest(envelope.comment ?? 'Codeforces handle not found', 'CF_HANDLE_NOT_FOUND');
  }
  return envelope.result[0];
}

async function fetchCodeforcesSubmissions(handle: string): Promise<CfSubmission[]> {
  const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=2000`;
  const envelope = await cfFetch<{ status: string; result?: CfSubmission[] }>(url);
  return envelope.status === 'OK' && Array.isArray(envelope.result) ? envelope.result : [];
}

async function fetchCodeforcesRatingHistory(handle: string): Promise<CfRatingChange[]> {
  const url = `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`;
  const envelope = await cfFetch<{ status: string; result?: CfRatingChange[] }>(url);
  return envelope.status === 'OK' && Array.isArray(envelope.result) ? envelope.result : [];
}

async function fetchCodeforcesUpcomingContests(): Promise<CfContest[]> {
  const url = `https://codeforces.com/api/contest.list?gym=false`;
  const envelope = await cfFetch<{ status: string; result?: CfContest[] }>(url);
  if (envelope.status !== 'OK' || !Array.isArray(envelope.result)) return [];
  return envelope.result
    .filter((c) => c.phase === 'BEFORE')
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
    .slice(0, 5);
}

async function cfFetch<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(CF_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw AppError.badRequest('Codeforces API request timed out', 'CF_API_TIMEOUT');
    }
    throw AppError.badRequest('Unable to reach Codeforces API', 'CF_API_UNAVAILABLE');
  }

  if (!res.ok) {
    throw AppError.badRequest(`Codeforces API returned HTTP ${res.status}`, 'CF_API_HTTP_ERROR');
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw AppError.badRequest('Codeforces API returned malformed JSON', 'CF_API_MALFORMED');
  }
}
