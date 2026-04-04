import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required').max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  notes: z.string().max(500).optional(),
});

export const updateRecordSchema = createRecordSchema.partial();

// Helper: treat empty strings as undefined (prevents 422 on empty query params)
const emptyToUndefined = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.string().optional()
);

const dateField = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
);

export const recordFilterSchema = z.object({
  type: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.enum(['income', 'expense']).optional()
  ),
  category: emptyToUndefined,
  date:     dateField,
  dateFrom: dateField,
  dateTo:   dateField,
  page:  z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});


export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type RecordFilterInput = z.infer<typeof recordFilterSchema>;
