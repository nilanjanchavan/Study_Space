import { Router } from 'express';
import { start, end, cancel, current, getById, history } from '../controllers/focus.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import {
  startFocusSchema,
  historyFocusQuerySchema,
  focusIdParamSchema,
} from '../validators/focus.validators';

const router = Router();

/**
 * Focus Session routes — all require authentication.
 * At most one active Focus Session (RUNNING) per user; enforced in the service.
 * Pomodoros started while a Focus Session is active are auto-associated with it.
 */
router.use(authenticate);

router.post('/start', validate(startFocusSchema, 'body'), start);
router.post('/end', end);
router.post('/cancel', cancel);

// NOTE: /history must be declared BEFORE /:id to avoid the param route
// capturing "history" as an id (which would 400 on UUID validation).
router.get('/current', current);
router.get('/history', validate(historyFocusQuerySchema, 'query'), history);
router.get('/:id', validate(focusIdParamSchema, 'params'), getById);

export default router;
