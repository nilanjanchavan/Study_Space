import { z } from 'zod';

/**
 * Codeforces handle rules (per codeforces.com):
 *  - 3–24 characters
 *  - letters, digits, underscores, hyphens, dots only
 */
export const codeforcesHandleSchema = z
  .string()
  .trim()
  .min(3, 'Handle must be at least 3 characters')
  .max(24, 'Handle must be at most 24 characters')
  .regex(/^[A-Za-z0-9_.-]+$/, 'Handle may only contain letters, numbers, _ . -');

export const upsertCodeforcesSchema = z.object({
  handle: codeforcesHandleSchema,
});

export type UpsertCodeforcesInput = z.infer<typeof upsertCodeforcesSchema>;
