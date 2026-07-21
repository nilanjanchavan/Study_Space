import { Router } from 'express';
import { get, update } from '../controllers/music.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { updateMusicSchema } from '../validators/music.validators';

const router = Router();

/**
 * Music preference routes — all require authentication.
 * GET auto-creates default preferences on first access.
 */
router.use(authenticate);

router.get('/preferences', get);
router.patch('/preferences', validate(updateMusicSchema, 'body'), update);

export default router;
