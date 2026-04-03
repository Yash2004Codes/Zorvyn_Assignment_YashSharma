import db from '../db/database';
import { FinancialRecord } from '../models/types';
import { CreateRecordInput, UpdateRecordInput, RecordFilterInput } from '../validators/record.validator';

export function createRecord(input: CreateRecordInput, createdBy: number): FinancialRecord {
  const stmt = db.prepare(`
    INSERT INTO financial_records (amount, type, category, date, notes, created_by)
    VALUES (@amount, @type, @category, @date, @notes, @created_by)
  `);

  const result = stmt.run({ ...input, notes: input.notes ?? null, created_by: createdBy });
  return db.prepare('SELECT * FROM financial_records WHERE id = ?').get(result.lastInsertRowid) as FinancialRecord;
}

export function getRecords(filters: RecordFilterInput & { userId: number }) {
  let query = 'SELECT * FROM financial_records WHERE is_deleted = 0 AND created_by = @userId';
  const queryParams: any = { userId: filters.userId };

  if (filters.type) {
    query += ' AND type = @type';
    queryParams.type = filters.type;
  }
  if (filters.category) {
    query += ' AND category LIKE @category';
    queryParams.category = `%${filters.category}%`;
  }
  if (filters.dateFrom) {
    query += ' AND date >= @dateFrom';
    queryParams.dateFrom = filters.dateFrom;
  }
  if (filters.dateTo) {
    query += ' AND date <= @dateTo';
    queryParams.dateTo = filters.dateTo;
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  const countQuery = query.replace('SELECT *', 'SELECT count(*) as count');
  const total = (db.prepare(countQuery).get(queryParams) as { count: number }).count;

  const records = db.prepare(`
    ${query}
    ORDER BY date DESC, created_at DESC
    LIMIT @limit OFFSET @offset
  `).all({ ...queryParams, limit, offset }) as FinancialRecord[];

  return {
    records,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export function getRecordById(id: number): FinancialRecord {
  const record = db.prepare('SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0').get(id) as FinancialRecord | undefined;
  if (!record) throw new Error('Record not found');
  return record;
}

export function updateRecord(id: number, input: UpdateRecordInput): FinancialRecord {
  const record = db.prepare('SELECT * FROM financial_records WHERE id = ? AND is_deleted = 0').get(id);
  if (!record) throw new Error('Record not found');

  const fields: string[] = [];
  const values: Record<string, unknown> = { id };

  if (input.amount   !== undefined) { fields.push('amount = @amount');     values.amount = input.amount; }
  if (input.type     !== undefined) { fields.push('type = @type');         values.type = input.type; }
  if (input.category !== undefined) { fields.push('category = @category'); values.category = input.category; }
  if (input.date     !== undefined) { fields.push('date = @date');         values.date = input.date; }
  if (input.notes    !== undefined) { fields.push('notes = @notes');       values.notes = input.notes; }

  if (fields.length === 0) throw new Error('No fields to update');

  fields.push("updated_at = datetime('now')");
  db.prepare(`UPDATE financial_records SET ${fields.join(', ')} WHERE id = @id`).run(values);

  return db.prepare('SELECT * FROM financial_records WHERE id = ?').get(id) as FinancialRecord;
}

export function deleteRecord(id: number): void {
  const record = db.prepare('SELECT id FROM financial_records WHERE id = ? AND is_deleted = 0').get(id);
  if (!record) throw new Error('Record not found');
  db.prepare("UPDATE financial_records SET is_deleted = 1, updated_at = datetime('now') WHERE id = ?").run(id);
}
