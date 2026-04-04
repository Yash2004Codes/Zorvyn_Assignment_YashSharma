import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateUserSchema } from '../validators/user.validator';

const router = Router();

// All user management routes require auth + admin role
router.use(authenticate, requireAdmin);

// GET  /api/users
router.get('/', UserController.getAllUsers);

// POST /api/users
router.post('/', validate(updateUserSchema), UserController.createUser);

// GET  /api/users/:id
router.get('/:id', UserController.getUserById);

// PATCH /api/users/:id
router.patch('/:id', validate(updateUserSchema), UserController.updateUser);

// DELETE /api/users/:id  (soft deactivate)
router.delete('/:id', UserController.deactivateUser);

export default router;
