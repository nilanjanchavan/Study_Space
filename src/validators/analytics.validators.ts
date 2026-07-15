import { z } from 'zod';

/** Query for daily/weekly/monthly — optional date override (defaults to today). */
export const analyticsDateQuerySchema = z.object({
  date: z.coerce.date().optional(),
});

export type AnalyticsDateQuery = z.infer<typeof analyticsDateQuerySchema>;
