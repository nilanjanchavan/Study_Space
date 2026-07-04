import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authRateLimiter } from '../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from '../validators/auth.validators';

const router = Router();

/**
 * Auth routes — all rate-limited to mitigate brute-force / credential stuffing.
 * Refresh token is read from the httpOnly cookie primarily.
 */
router.use(authRateLimiter);

router.post('/register', validate(registerSchema, 'body'), register);
router.post('/login', validate(loginSchema, 'body'), login);
router.post('/refresh', validate(refreshSchema, 'body'), refresh);
router.post('/logout', logout);

// Authenticated user info.
router.get('/me', authenticate, me);

export default router;
