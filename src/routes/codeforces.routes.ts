import { Router } from 'express';
import { get, upsert, sync, remove } from '../controllers/codeforces.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { upsertCodeforcesSchema } from '../validators/codeforces.validators';

const router = Router();

/**
 * Codeforces integration routes — all require authentication.
 * Sync fetches from the live CF API; all other endpoints use cached data.
 */
router.use(authenticate);

router.get('/profile', get);
router.put('/profile', validate(upsertCodeforcesSchema, 'body'), upsert);
router.post('/sync', sync);
router.delete('/profile', remove);

export default router;
