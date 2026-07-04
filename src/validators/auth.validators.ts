import { z } from 'zod';

/**
 * Shared field schemas.
 * Password policy: 8–100 chars, at least one letter and one number.
 */
const emailField = z.string().email('Invalid email').max(254).toLowerCase().trim();
const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  email: emailField,
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username too long')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Username may only contain letters, numbers, _ . -')
    .trim(),
  password: passwordField,
  name: z.string().max(100).trim().optional(),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required').max(100),
});

/** Optional JSON body for refresh; the token is usually read from the cookie instead. */
export const refreshSchema = z
  .object({
    refreshToken: z.string().min(1).max(512).optional(),
  })
  .optional()
  .default({});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
