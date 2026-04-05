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

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Get all records (Analyst/Admin)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [income, expense] }
 *     responses:
 *       200:
 *         description: List of records
 */
router.get('/', requireAnalyst, validate(recordFilterSchema, 'query'), RecordController.getRecords);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get record by ID
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Record details
 */
router.get('/:id', requireAnalyst, RecordController.getRecordById);

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create new record (Admin)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', requireAdmin, validate(createRecordSchema), RecordController.createRecord);

/**
 * @swagger
 * /records/{id}:
 *   patch:
 *     summary: Update record (Admin)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:id', requireAdmin, validate(updateRecordSchema), RecordController.updateRecord);

// PUT mapping for standard compatibility
router.put('/:id', requireAdmin, validate(updateRecordSchema), RecordController.updateRecord);

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Soft delete record (Admin)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', requireAdmin, RecordController.deleteRecord);

export default router;
