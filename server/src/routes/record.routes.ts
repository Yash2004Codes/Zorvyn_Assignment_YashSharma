import { Router } from 'express';
import * as RecordController from '../controllers/record.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireAnalyst } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
} from '../validators/record.validator';

const router = Router();

// All record routes require authentication
router.use(authenticate);

// GET  /api/records  — viewer, analyst, admin (any authenticated user)
router.get('/', validate(recordFilterSchema, 'query'), RecordController.getRecords);

// GET  /api/records/:id — viewer, analyst, admin
router.get('/:id', RecordController.getRecordById);

// POST /api/records   — admin only
router.post('/', requireAdmin, validate(createRecordSchema), RecordController.createRecord);

// PATCH /api/records/:id — admin only
router.patch('/:id', requireAdmin, validate(updateRecordSchema), RecordController.updateRecord);

// DELETE /api/records/:id — admin only
router.delete('/:id', requireAdmin, RecordController.deleteRecord);

export default router;
