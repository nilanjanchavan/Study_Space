import { Router } from 'express';
import { create, list, getById, update, remove } from '../controllers/todo.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import {
  createTodoSchema,
  updateTodoSchema,
  listTodosQuerySchema,
  todoIdParamSchema,
} from '../validators/todo.validators';

const router = Router();

/**
 * Todo routes — all require authentication.
 * All endpoints are scoped to the authenticated user (users cannot access
 * other users' todos; ownership is checked in the service layer).
 */
router.use(authenticate);

router.post('/', validate(createTodoSchema, 'body'), create);
router.get('/', validate(listTodosQuerySchema, 'query'), list);
router.get('/:id', validate(todoIdParamSchema, 'params'), getById);
router.patch('/:id', validate(todoIdParamSchema, 'params'), validate(updateTodoSchema, 'body'), update);
router.delete('/:id', validate(todoIdParamSchema, 'params'), remove);

export default router;
