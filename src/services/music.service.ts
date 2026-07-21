import { MusicSource } from '@prisma/client';
import { prisma } from '../config/prisma';
import type { UpdateMusicInput } from '../validators/music.validators';

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

export type MusicPreferenceItem = {
  id: string;
  source: string;
  volume: number;
  isAutoplay: boolean;
  customPlaylistUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function serialize(p: {
  id: string;
  source: string;
  volume: number;
  isAutoplay: boolean;
  customPlaylistUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MusicPreferenceItem {
  return {
    id: p.id,
    source: p.source,
    volume: p.volume,
    isAutoplay: p.isAutoplay,
    customPlaylistUrl: p.customPlaylistUrl,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ───────────────────────────────────────────────────────────────────────────
// GET — auto-create defaults if missing
// ───────────────────────────────────────────────────────────────────────────

export async function getPreferences(userId: string): Promise<MusicPreferenceItem> {
  // upsert so first GET materializes the default row.
  const pref = await prisma.musicPreference.upsert({
    where: { userId },
    update: {},
    create: { userId }, // schema defaults: NONE / 50 / false / null
  });
  return serialize(pref);
}

// ───────────────────────────────────────────────────────────────────────────
// PATCH — partial update
// ───────────────────────────────────────────────────────────────────────────

export async function updatePreferences(
  userId: string,
  input: UpdateMusicInput,
): Promise<MusicPreferenceItem> {
  // Ensure the row exists (create defaults) before patching.
  await prisma.musicPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const data: {
    source?: MusicSource;
    volume?: number;
    isAutoplay?: boolean;
    customPlaylistUrl?: string | null;
  } = {};

  if (input.source !== undefined) data.source = input.source as MusicSource;
  if (input.volume !== undefined) data.volume = input.volume;
  if (input.isAutoplay !== undefined) data.isAutoplay = input.isAutoplay;
  if (input.customPlaylistUrl !== undefined) data.customPlaylistUrl = input.customPlaylistUrl;

  const updated = await prisma.musicPreference.update({
    where: { userId },
    data,
  });

  return serialize(updated);
}
