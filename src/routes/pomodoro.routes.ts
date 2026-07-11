import { Router } from 'express';
import {
  start,
  pause,
  resume,
  complete,
  cancel,
  current,
  history,
} from '../controllers/pomodoro.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { startPomodoroSchema, historyQuerySchema } from '../validators/pomodoro.validators';

const router = Router();

/**
 * Pomodoro routes — all require authentication.
 * At most one active session (RUNNING or PAUSED) per user; enforced in the service.
 */
router.use(authenticate);

router.post('/start', validate(startPomodoroSchema, 'body'), start);
router.post('/pause', pause);
router.post('/resume', resume);
router.post('/complete', complete);
router.post('/cancel', cancel);
router.get('/current', current);
router.get('/history', validate(historyQuerySchema, 'query'), history);

export default router;
