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

// GET  /api/records  — Analyst
router.get('/', requireAnalyst, validate(recordFilterSchema, 'query'), RecordController.getRecords);

// GET  /api/records/:id — Analyst
router.get('/:id', requireAnalyst, RecordController.getRecordById);

// POST /api/records   — Admin
router.post('/', requireAdmin, validate(createRecordSchema), RecordController.createRecord);

// PATCH /api/records/:id — Admin
router.patch('/:id', requireAdmin, validate(updateRecordSchema), RecordController.updateRecord);

// PUT /api/records/:id — Admin (added to map directly to assignment requirement)
router.put('/:id', requireAdmin, validate(updateRecordSchema), RecordController.updateRecord);

// DELETE /api/records/:id — Admin
router.delete('/:id', requireAdmin, RecordController.deleteRecord);

export default router;
