import { z } from 'zod';

const MusicSourceEnum = z.enum(['NONE', 'LOFI', 'NATURE', 'WHITE_NOISE', 'CUSTOM']);

export const updateMusicSchema = z
  .object({
    source: MusicSourceEnum.optional(),
    volume: z.coerce.number().int().min(0, 'Volume must be between 0 and 100').max(100, 'Volume must be between 0 and 100').optional(),
    isAutoplay: z.boolean().optional(),
    customPlaylistUrl: z
      .union([z.string().url('customPlaylistUrl must be a valid URL'), z.literal('')])
      .optional()
      .transform((v) => (v === '' ? null : v ?? undefined)),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateMusicInput = z.infer<typeof updateMusicSchema>;
