import { Router } from 'express';
import { dashboard, daily, weekly, monthly, streak } from '../controllers/analytics.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { analyticsDateQuerySchema } from '../validators/analytics.validators';

const router = Router();

/**
 * Analytics routes — all require authentication.
 * All data is scoped to the authenticated user.
 */
router.use(authenticate);

router.get('/dashboard', dashboard);
router.get('/daily', validate(analyticsDateQuerySchema, 'query'), daily);
router.get('/weekly', weekly);
router.get('/monthly', validate(analyticsDateQuerySchema, 'query'), monthly);
router.get('/streak', streak);

export default router;
